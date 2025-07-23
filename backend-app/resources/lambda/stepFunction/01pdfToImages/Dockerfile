FROM public.ecr.aws/lambda/python:3.11.2023.11.13.10-x86_64

RUN yum update -y && \
    yum install -y \
        python3-devel \
        gcc \
        poppler \
        poppler-utils \
        libjpeg-devel \
        zlib-devel \
        libxml2-devel \
        libxslt-devel \
        fonts-dejavu-core \
        dejavu-sans-fonts \
        && yum clean all \
        && rm -rf /var/cache/yum

# Create poppler directory and copy binaries
RUN mkdir -p /opt/poppler/bin && \
    cp /usr/bin/pdftoppm /opt/poppler/bin/pdftoppm && \
    cp /usr/bin/pdftocairo /opt/poppler/bin/pdftocairo && \
    cp /usr/bin/pdfinfo /opt/poppler/bin/pdfinfo && \
    chmod 755 /opt/poppler/bin/* && \
    ls -l /opt/poppler/bin

# Verify poppler installation
RUN /opt/poppler/bin/pdftoppm -v

# Set environment variables
ENV PATH="/opt/poppler/bin:${PATH}"

# Set the working directory
WORKDIR /var/task

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy your Lambda function code
COPY . .

# Points to the handler function of your lambda function
CMD ["lambda.handler"]