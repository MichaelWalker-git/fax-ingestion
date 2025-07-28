import os
import json
from typing import Dict, Any, List, Optional
import boto3
from pdf2image import convert_from_bytes
from io import BytesIO
from aws_lambda_powertools import Logger
import subprocess
from PIL import Image, ImageDraw, ImageFont
import mammoth
import markdown
import textwrap
import urllib.parse

logger = Logger(service="FILE_DB_REPRESENTATION")

REGION = os.environ.get('REGION', 'eu-central-1')

s3_client = boto3.client('s3')

os.environ['PATH'] = f"/usr/bin:{os.environ.get('PATH', '')}"

# Constants for text rendering
PAGE_WIDTH = 2480  # A4 at 300 DPI
PAGE_HEIGHT = 3508
MARGIN = 200
FONT_SIZE = 36
LINE_HEIGHT = int(FONT_SIZE * 1.5)
MAX_CHARS_PER_LINE = 80

def process_page(image, bucket, output_key: str, format: str) -> None:
    """Process a single page and upload to S3."""
    try:
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format=format, quality=100)
        img_byte_arr = img_byte_arr.getvalue()

        s3_client.put_object(
            Bucket=bucket,
            Key=output_key,
            Body=img_byte_arr,
            ContentType=f'image/{format}'
        )
    except Exception as e:
        logger.error(f"Error processing page: {e}")
        raise


def get_lambda_response(body: Dict[str, Any] = None, status_code: int = 200):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body or {})
    }


def parse_s3_key(s3_path: str, output_prefix: str, format: str) -> dict:
    try:
        key_path = s3_path.split('s3://')[-1] if 's3://' in s3_path else s3_path
        path_parts = key_path.split('/')
        filename = path_parts[1].split('.')[0]

        if len(path_parts) != 2:
            raise ValueError(f"Invalid S3 key format: {s3_path}")

        return {
            'filename': filename,
            'keyPath': key_path,
            'outputPrefix': output_prefix,
            'format': format
        }

    except Exception as e:
        raise ValueError(f"Failed to parse S3 key: {s3_path}") from e


def verify_poppler():
    try:
        logger.info("Verifying poppler installation...")
        # Check binary location
        result = subprocess.run(['ls', '-l', '/opt/poppler/bin'], capture_output=True, text=True)
        logger.info(f"Checking /opt/poppler/bin contents: {result.stdout}")

        # Try running pdftoppm
        result = subprocess.run(['/opt/poppler/bin/pdftoppm', '-v'], capture_output=True, text=True)
        logger.info(f"Testing pdftoppm: {result.stderr}")
        return True
    except Exception as e:
        logger.error(f"Poppler verification failed: {e}")
        return False


def text_to_image(text: str, title: Optional[str] = None) -> List[Image.Image]:
    """Convert text content to a list of PIL Image objects."""
    try:
        # Try to use a standard font
        font = ImageFont.truetype("DejaVuSans.ttf", FONT_SIZE)
    except IOError:
        # Fallback to default
        font = ImageFont.load_default()

    # Preprocess the text (wrap lines to fit page width)
    wrapped_lines = []
    for line in text.split('\n'):
        if line.strip() == '':
            wrapped_lines.append('')  # Preserve empty lines
        else:
            wrapped_lines.extend(textwrap.wrap(line, width=MAX_CHARS_PER_LINE))

    # Calculate how many lines fit on one page
    lines_per_page = (PAGE_HEIGHT - 2 * MARGIN) // LINE_HEIGHT
    if title:
        lines_per_page -= 2  # Reserve space for title and a blank line

    # Split text into pages
    pages = []
    current_page_lines = []

    for line in wrapped_lines:
        if len(current_page_lines) >= lines_per_page:
            # Current page is full, start a new one
            pages.append(current_page_lines)
            current_page_lines = []
        current_page_lines.append(line)

    # Add the last page if it has content
    if current_page_lines:
        pages.append(current_page_lines)

    # Create images for each page
    images = []
    for page_lines in pages:
        img = Image.new('RGB', (PAGE_WIDTH, PAGE_HEIGHT), color='white')
        draw = ImageDraw.Draw(img)

        y_position = MARGIN

        # Add title if provided (only on the first page)
        if title and pages.index(page_lines) == 0:
            draw.text((MARGIN, y_position), title, font=font, fill='black')
            y_position += LINE_HEIGHT * 2  # Move down after title + blank line

        # Add text lines
        for line in page_lines:
            draw.text((MARGIN, y_position), line, font=font, fill='black')
            y_position += LINE_HEIGHT

        images.append(img)

    return images


def convert_docx_to_html(docx_content: bytes) -> str:
    """Convert DOCX content to HTML using mammoth."""
    try:
        result = mammoth.convert_to_html(BytesIO(docx_content))
        return result.value
    except Exception as e:
        logger.error(f"Error converting DOCX to HTML: {e}")
        raise


def html_to_plain_text(html: str) -> str:
    """Convert HTML to plain text by removing HTML tags."""
    from html.parser import HTMLParser

    class MLStripper(HTMLParser):
        def __init__(self):
            super().__init__()
            self.reset()
            self.strict = False
            self.convert_charrefs = True
            self.text = []

        def handle_data(self, d):
            self.text.append(d)

        def get_data(self):
            return ''.join(self.text)

    stripper = MLStripper()
    stripper.feed(html)
    return stripper.get_data()


def process_pdf(pdf_content: bytes, key_info: Dict[str, str], fileId: str, bucket: str) -> List[str]:
    """Process PDF file and return list of output S3 keys."""
    logger.info("Processing PDF file...")

    images = convert_from_bytes(
        pdf_content,
        dpi=100,
        fmt="jpeg",
        thread_count=2,
        poppler_path="/opt/poppler/bin"
    )

    logger.info(f"Extracted {len(images)} pages from PDF")
    output_keys = []
    filename = key_info.get('filename', 'image')
    outputPrefix = key_info.get('outputPrefix', '')
    format = key_info.get('format', 'jpeg')

    for i, image in enumerate(images):
        output_key = f"{outputPrefix}/{filename}-{i + 1}.{format}"
        process_page(image, bucket, output_key, format)
        output_keys.append({ 'key': output_key, 'page': i + 1, 'filename': filename, 'fileId': fileId })
        logger.info(f"Processed PDF page {i + 1}/{len(images)}")

    return output_keys


def process_docx(docx_content: bytes, key_info: Dict[str, str], fileId: str, bucket: str) -> List[str]:
    """Process DOCX file and return list of output S3 keys."""
    logger.info("Processing DOCX file...")

    try:
        # Convert DOCX to HTML and then to plain text
        html = convert_docx_to_html(docx_content)
        text = html_to_plain_text(html)

        # Get the title from the filename
        title = os.path.splitext(key_info['filename'])[0]

        # Convert text to images
        images = text_to_image(text, title)

        logger.info(f"Created {len(images)} pages from DOCX")
        output_keys = []
        filename = key_info.get('filename', 'image')
        outputPrefix = key_info.get('outputPrefix', '')
        format = key_info.get('format', 'jpeg')

        for i, image in enumerate(images):
            output_key = f"{outputPrefix}/{filename}-{i + 1}.{format}"
            process_page(image, bucket, output_key, format)
            output_keys.append({ 'key': output_key, 'page': i + 1, 'filename': filename, 'fileId': fileId })
            logger.info(f"Processed DOCX page {i + 1}/{len(images)}")

        return output_keys
    except Exception as e:
        logger.error(f"Error processing DOCX file: {e}")
        raise


def process_txt_file(text_content: bytes, key_info: Dict[str, str], fileId: str, bucket: str, is_markdown: bool = False) -> List[str]:
    """Process TXT or MD file and return list of output S3 keys."""
    try:
        # Decode bytes to string
        content = text_content.decode('utf-8')

        # Convert markdown to HTML if needed
        if is_markdown:
            logger.info("Processing Markdown file...")
            content = markdown.markdown(content)
            content = html_to_plain_text(content)
        else:
            logger.info("Processing TXT file...")

        # Get the title from the filename
        title = os.path.splitext(key_info['filename'])[0]

        # Convert text to images
        images = text_to_image(content, title)

        logger.info(f"Created {len(images)} pages from text file")
        output_keys = []
        filename = key_info.get('filename', 'image')
        outputPrefix = key_info.get('outputPrefix', '')
        format = key_info.get('format', 'jpeg')

        for i, image in enumerate(images):
            output_key = f"{outputPrefix}/{filename}-{i + 1}.{format}"
            process_page(image, bucket, output_key, format)
            output_keys.append({ 'key': output_key, 'page': i + 1, 'filename': filename, 'fileId': fileId })
            logger.info(f"Processed text page {i + 1}/{len(images)}")

        return output_keys
    except Exception as e:
        logger.error(f"Error processing text file: {e}")
        raise

def decode_utf_characters(input_string):
    return urllib.parse.unquote(input_string)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        logger.info(f"Processing event: {json.dumps(event)}")

        bucket = event['bucket']
        resultBucket = event['resultBucket']
        key = event['pdfKey']
        fileId = event['fileId']
        output_prefix = event.get('outputPrefix', '')
        format = event.get('format', 'png')

        # Get file extension
        file_ext = os.path.splitext(key.lower())[1]
        keyPath = decode_utf_characters(key).replace('+', ' ')
        key_info = parse_s3_key(key, output_prefix, format)

        logger.info(f"file_ext: {file_ext}")
        logger.info(f"key_info: {key_info}")

        response = s3_client.get_object(Bucket=bucket, Key=keyPath)
        file_content = response['Body'].read()

        logger.info(f"response: {response}")
        logger.info(f"file_content: {file_content}")

        # Process based on file type
        if file_ext == '.pdf':
            if not verify_poppler():
                raise Exception("Poppler verification failed")

            output_keys = process_pdf(file_content, key_info, fileId, resultBucket)

        elif file_ext in ['.doc', '.docx']:
            output_keys = process_docx(file_content, key_info, fileId, resultBucket)

        elif file_ext == '.txt':
            output_keys = process_txt_file(file_content, key_info, fileId, resultBucket)

        elif file_ext == '.md':
            output_keys = process_txt_file(file_content, key_info, fileId, resultBucket, is_markdown=True)

        else:
            # Non-supported file type, just mark as uploaded without children
            logger.info(f"File type {file_ext} not supported for conversion")
            return get_lambda_response({'message': f'File type {file_ext} not supported for conversion'})

        return {
            **event,
            'pages': len(output_keys),
            'items': output_keys
        }

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': f"Error processing file: {str(e)}"
            })
        }
