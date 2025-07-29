#!/bin/bash

# Complete AWS Marketplace Template Automation Script
# This script automatically finds nested templates and updates URLs

set -e  # Exit on any error

BUCKET_NAME="fax-ingestion-template-public"
BUCKET_REGION="us-east-2"
MAIN_TEMPLATE=""
MAIN_TEMPLATE_YAML=""
CDK_OUTPUT_DIR=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
        exit 1
    fi

    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    # Check if yq is installed
    if ! command -v yq &> /dev/null; then
        print_error "yq is not installed. Please install yq for YAML conversion."
        echo "Install options:"
        echo "  macOS: brew install yq"
        echo "  Ubuntu/Debian: sudo snap install yq"
        echo "  Manual: https://github.com/mikefarah/yq#install"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi

    print_success "All prerequisites met"
}

# Function to find CDK output directory and main template
find_cdk_output_and_template() {
    print_status "Looking for CDK output directory..."

    # Common CDK output directory patterns
    cdk_paths=(
        "cdk.out/assembly-prod"
        "cdk.out/assembly-*"
        "cdk.out"
        "dist/assembly-prod"
        "dist/assembly-*"
        "dist"
        "build"
        "output"
    )

    CDK_OUTPUT_DIR=""

    for path_pattern in "${cdk_paths[@]}"; do
        # Handle glob patterns
        if [[ "$path_pattern" == *"*"* ]]; then
            paths=($(ls -d $path_pattern 2>/dev/null || true))
            if [ ${#paths[@]} -gt 0 ]; then
                CDK_OUTPUT_DIR="${paths[0]}"
                break
            fi
        else
            if [ -d "$path_pattern" ]; then
                CDK_OUTPUT_DIR="$path_pattern"
                break
            fi
        fi
    done

    if [ -z "$CDK_OUTPUT_DIR" ]; then
        print_error "Could not find CDK output directory."
        echo "Looking for directories like:"
        echo "  - cdk.out/assembly-prod"
        echo "  - cdk.out/assembly-*"
        echo "  - cdk.out"
        echo "  - dist, build, output"
        echo ""
        echo "Available directories:"
        find . -maxdepth 2 -type d -name "*assembly*" 2>/dev/null || echo "No assembly directories found"
        ls -la | grep "^d" || echo "No directories found"
        echo ""
        echo "Please specify your CDK output directory:"
        read -p "CDK output directory: " CDK_OUTPUT_DIR

        if [ ! -d "$CDK_OUTPUT_DIR" ]; then
            print_error "Directory '$CDK_OUTPUT_DIR' does not exist."
            exit 1
        fi
    fi

    print_success "Found CDK output directory: $CDK_OUTPUT_DIR"

    # Navigate to CDK output directory
    cd "$CDK_OUTPUT_DIR"
    print_status "Changed to directory: $(pwd)"

    # Now find the main template
    print_status "Looking for main template file..."

    # Look for common main template patterns
    possible_templates=(
        "*.template.json"
        "*Stack.template.json"
        "BackendAppStack.template.json"
        "template.json"
        "*prod*.template.json"
        "*Prod*.template.json"
    )

    for pattern in "${possible_templates[@]}"; do
        files=($(ls $pattern 2>/dev/null | grep -v nested || true))
        if [ ${#files[@]} -gt 0 ]; then
            MAIN_TEMPLATE="${files[0]}"
            break
        fi
    done

    if [ -z "$MAIN_TEMPLATE" ]; then
        print_error "Could not find main template file in $CDK_OUTPUT_DIR."
        echo "Available JSON files:"
        ls -la *.json 2>/dev/null || echo "No JSON files found"
        echo ""
        echo "Please specify your main template file:"
        read -p "Template file name: " MAIN_TEMPLATE

        if [ ! -f "$MAIN_TEMPLATE" ]; then
            print_error "File '$MAIN_TEMPLATE' does not exist."
            exit 1
        fi
    fi

    print_success "Found main template: $MAIN_TEMPLATE"
}

# Function to create the update script in CDK output directory
create_update_script() {
    print_status "Creating template processing scripts..."

    # Create the JavaScript update script
    cat > update_template_urls.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

function updateTemplateUrls(templateFile, bucketName, bucketRegion = 'us-east-2') {
    try {
        console.log(`Reading template file: ${templateFile}`);
        const templateContent = fs.readFileSync(templateFile, 'utf8');
        const template = JSON.parse(templateContent);

        const nestedTemplateFiles = glob.sync('*.nested.template.json');
        console.log(`Found ${nestedTemplateFiles.length} nested template files:`);
        nestedTemplateFiles.forEach(file => console.log(`  - ${file}`));

        if (nestedTemplateFiles.length === 0) {
            console.log('⚠️  No nested template files found.');
            return templateFile;
        }

        let resourcesUpdated = 0;

        if (template.Resources) {
            for (const [resourceId, resource] of Object.entries(template.Resources)) {
                if (resource.Type === 'AWS::CloudFormation::Stack') {
                    if (resource.Properties && resource.Properties.TemplateURL) {
                        const oldUrl = resource.Properties.TemplateURL;
                        let templateFileName = null;

                        if (resource.Metadata && resource.Metadata['aws:asset:path']) {
                            templateFileName = resource.Metadata['aws:asset:path'];
                        } else {
                            const resourceBaseName = resourceId
                                .replace(/NestedStack.*Resource.*$/, '')
                                .replace(/Stack$/, '')
                                .toLowerCase();

                            templateFileName = nestedTemplateFiles.find(file => {
                                const fileBaseName = file.toLowerCase();
                                return fileBaseName.includes(resourceBaseName) ||
                                       resourceBaseName.includes(fileBaseName.split('nested')[0].replace(/[^a-z]/g, ''));
                            });
                        }

                        if (templateFileName && nestedTemplateFiles.includes(templateFileName)) {
                            const newUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${templateFileName}`;
                            resource.Properties.TemplateURL = newUrl;

                            console.log(`✅ Updated ${resourceId}:`);
                            console.log(`  File: ${templateFileName}`);
                            resourcesUpdated++;
                        }
                    }
                }
            }
        }

        const outputFile = templateFile.replace(/\.json$/, '_updated.json');
        fs.writeFileSync(outputFile, JSON.stringify(template, null, 2));

        console.log(`📊 Updated ${resourcesUpdated} nested stack references`);
        console.log(`📄 Updated template saved as: ${outputFile}`);

        return outputFile;

    } catch (error) {
        throw new Error(`Failed to process template: ${error.message}`);
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node update_template_urls.js <template_file> <s3_bucket_name> [region]');
        process.exit(1);
    }

    const templateFile = args[0];
    const bucketName = args[1];
    const bucketRegion = args[2] || 'us-east-2';

    if (!fs.existsSync(templateFile)) {
        console.error(`❌ Error: Template file '${templateFile}' does not exist.`);
        process.exit(1);
    }

    try {
        const updatedFile = updateTemplateUrls(templateFile, bucketName, bucketRegion);
        console.log(`🎉 Success! Updated template: ${updatedFile}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { updateTemplateUrls };
EOF

    # Create the outputs fixer script
    cat > fix_outputs.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

function fixTemplateOutputs(templateFile) {
    try {
        console.log(`Fixing outputs in: ${templateFile}`);
        const templateContent = fs.readFileSync(templateFile, 'utf8');
        const template = JSON.parse(templateContent);

        let outputsFixed = 0;

        if (template.Outputs) {
            for (const [outputName, outputValue] of Object.entries(template.Outputs)) {
                if (outputValue.Value) {
                    const originalValue = outputValue.Value;
                    let needsFix = false;
                    let fixedValue = originalValue;

                    if (Array.isArray(originalValue)) {
                        fixedValue = { "Fn::Join": [",", originalValue] };
                        needsFix = true;
                    } else if (typeof originalValue === 'object' && originalValue !== null) {
                        if (originalValue['Fn::GetAtt'] &&
                            Array.isArray(originalValue['Fn::GetAtt']) &&
                            originalValue['Fn::GetAtt'][1] &&
                            (originalValue['Fn::GetAtt'][1].includes('Ids') ||
                             originalValue['Fn::GetAtt'][1].includes('Subnets') ||
                             originalValue['Fn::GetAtt'][1].includes('SecurityGroups'))) {

                            fixedValue = { "Fn::Join": [",", originalValue] };
                            needsFix = true;
                        } else if (originalValue.Ref &&
                                (originalValue.Ref.includes('SubnetIds') ||
                                 originalValue.Ref.includes('SecurityGroupIds'))) {

                            fixedValue = { "Fn::Join": [",", originalValue] };
                            needsFix = true;
                        }
                    }

                    if (needsFix) {
                        outputValue.Value = fixedValue;
                        console.log(`  ✅ Fixed output '${outputName}'`);
                        outputsFixed++;
                    }
                }
            }
        }

        if (outputsFixed > 0) {
            fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));
            console.log(`  💾 Fixed template saved: ${templateFile}`);
        }

        return outputsFixed;

    } catch (error) {
        console.error(`❌ Error fixing ${templateFile}: ${error.message}`);
        return 0;
    }
}

function fixAllTemplates() {
    console.log('🔧 Fixing CloudFormation outputs...');

    const templateFiles = glob.sync('*.template.json');
    const nestedTemplateFiles = glob.sync('*.nested.template.json');
    const allTemplates = [...templateFiles, ...nestedTemplateFiles];

    let totalFixesApplied = 0;
    allTemplates.forEach(templateFile => {
        const fixes = fixTemplateOutputs(templateFile);
        totalFixesApplied += fixes;
    });

    console.log(`📊 Fixed outputs in ${totalFixesApplied} templates`);
    return totalFixesApplied;
}

if (require.main === module) {
    fixAllTemplates();
}

module.exports = { fixAllTemplates };
EOF

    # Install dependencies
    if [ ! -f "package.json" ]; then
        npm init -y > /dev/null 2>&1
    fi

    if ! node -e "require('glob')" 2>/dev/null; then
        print_status "Installing dependencies..."
        npm install glob --silent
    fi

    print_success "Template processing scripts created"
}

# Function to fix template outputs before uploading
fix_template_outputs() {
    print_status "Fixing CloudFormation outputs to ensure string compatibility..."
    node fix_outputs.js
    print_success "Template outputs fixed"
}

# Function to set up S3 bucket
setup_s3_bucket() {
    print_status "Setting up S3 bucket permissions..."

    if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
        print_warning "Bucket $BUCKET_NAME does not exist. Creating it..."
        aws s3 mb "s3://$BUCKET_NAME" --region "$BUCKET_REGION"
    fi

    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json

    print_success "S3 bucket configured"
}

# Function to upload nested templates
upload_nested_templates() {
    print_status "Finding and uploading nested template files..."

    nested_files=($(ls *.nested.template.json 2>/dev/null || true))

    if [ ${#nested_files[@]} -eq 0 ]; then
        print_warning "No nested template files found"
        return
    fi

    print_status "Found ${#nested_files[@]} nested template files"
    for file in "${nested_files[@]}"; do
        aws s3 cp "$file" "s3://$BUCKET_NAME/" --quiet
        print_success "Uploaded: $file"
    done
}

# Function to convert template to YAML and upload
convert_and_upload_main_template() {
    print_status "Processing and uploading main template..."

    node update_template_urls.js "$MAIN_TEMPLATE" "$BUCKET_NAME" "$BUCKET_REGION"

    updated_json="${MAIN_TEMPLATE%.*}_updated.json"
    if [ ! -f "$updated_json" ]; then
        print_error "Updated JSON template was not created"
        exit 1
    fi

    print_success "Updated JSON template created: $updated_json"

    print_status "Converting JSON to YAML..."
    updated_yaml="${MAIN_TEMPLATE%.*}_updated.yaml"

    if yq -P eval . "$updated_json" > "$updated_yaml"; then
        print_success "YAML template created: $updated_yaml"
    else
        print_error "Failed to convert JSON to YAML"
        exit 1
    fi

    print_status "Uploading templates to S3..."

    aws s3 cp "$updated_json" "s3://$BUCKET_NAME/template.json" --quiet
    print_success "Uploaded JSON template as template.json"

    aws s3 cp "$updated_yaml" "s3://$BUCKET_NAME/template.yaml" --quiet
    print_success "Uploaded YAML template as template.yaml"

    MAIN_TEMPLATE_YAML="$updated_yaml"
}

# Function to verify upload
verify_upload() {
    print_status "Verifying S3 upload..."
    echo "Files in S3 bucket:"
    aws s3 ls "s3://$BUCKET_NAME/" --human-readable
}

# Function to generate launch URLs
generate_launch_urls() {
    local json_launch_url="https://$BUCKET_REGION.console.aws.amazon.com/cloudformation/home?region=$BUCKET_REGION#/stacks/quickcreate?templateURL=https://$BUCKET_NAME.s3.$BUCKET_REGION.amazonaws.com/template.json&stackName=FaxIngestionApp&param_CustomerIdentifier=abc123&param_ProductCode=xyz789"

    local yaml_launch_url="https://$BUCKET_REGION.console.aws.amazon.com/cloudformation/home?region=$BUCKET_REGION#/stacks/quickcreate?templateURL=https://$BUCKET_NAME.s3.$BUCKET_REGION.amazonaws.com/template.yaml&stackName=FaxIngestionApp&param_CustomerIdentifier=abc123&param_ProductCode=xyz789"

    echo ""
    echo "🎉 Process Complete!"
    echo "==================="
    echo ""
    echo "📤 Uploaded files:"
    echo "  - template.json (JSON format)"
    echo "  - template.yaml (YAML format) ⭐ RECOMMENDED"
    echo "  - All nested template files"
    echo ""
    echo "🚀 Launch URLs for AWS Marketplace:"
    echo ""
    echo "YAML Template (Recommended):"
    echo "$yaml_launch_url"
    echo ""
    echo "JSON Template (Alternative):"
    echo "$json_launch_url"
    echo ""
    echo "📝 Next steps:"
    echo "1. Test the YAML launch URL to make sure it works"
    echo "2. Use the YAML URL for your AWS Marketplace listing"
    echo "3. When you rebuild your CDK, just run this script again"
    echo ""
    echo "💡 Tip: YAML templates are more readable and preferred for AWS Marketplace"
}

# Main execution
main() {
    echo "🚀 AWS Marketplace Template Automation"
    echo "======================================"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--bucket)
                BUCKET_NAME="$2"
                shift 2
                ;;
            -r|--region)
                BUCKET_REGION="$2"
                shift 2
                ;;
            -t|--template)
                MAIN_TEMPLATE="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  -b, --bucket    S3 bucket name (default: fax-ingestion-template-public)"
                echo "  -r, --region    AWS region (default: us-east-2)"
                echo "  -t, --template  Main template file (auto-detected if not specified)"
                echo "  -h, --help      Show this help message"
                echo ""
                echo "This script will:"
                echo "  1. Find your CDK output directory and templates"
                echo "  2. Fix CloudFormation outputs to ensure string compatibility"
                echo "  3. Update nested stack URLs to point to your S3 bucket"
                echo "  4. Convert the main template from JSON to YAML"
                echo "  5. Upload both JSON and YAML versions to S3"
                echo "  6. Provide launch URLs for AWS Marketplace"
                echo ""
                echo "Prerequisites:"
                echo "  - Node.js (for processing templates)"
                echo "  - AWS CLI (configured with credentials)"
                echo "  - yq (for JSON to YAML conversion)"
                echo "    Install: brew install yq (macOS) or sudo snap install yq (Linux)"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_status "Using bucket: $BUCKET_NAME in region: $BUCKET_REGION"

    check_prerequisites
    find_cdk_output_and_template
    create_update_script
    fix_template_outputs
    setup_s3_bucket
    upload_nested_templates
    convert_and_upload_main_template
    verify_upload
    generate_launch_urls
}

# Run main function
main "$@"
