# AWS Deployment Guide

This guide walks you through the steps to deploy the application using AWS CDK across different environments.

## Prerequisites

Before deploying, ensure you have the following:

- **AWS CLI** configured with appropriate credentials
- **AWS CDK** installed (`npm install -g aws-cdk`)
- **Node.js** and **npm** installed
- **AWS Account** with sufficient permissions

## Setup Instructions

### 1. AWS Configuration

The application uses AWS CDK for infrastructure deployment. AWS credentials will be pulled automatically from your configured AWS CLI or environment.

### 2. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
APP_PREFIX=IDP-POC
CDK_DEFAULT_REGION=eu-central-1
CDK_DEFAULT_ACCOUNT=your-aws-account-id
HUGGINGFACE_HUB_TOKEN=your-huggingface-token

OPENSEARCH_INDEX=embedding
OPENSEARCH_USER=master-user
OPENSEARCH_PASSWORD=your-secure-password
```

**Important**: Replace the placeholder values with your actual credentials:
- `CDK_DEFAULT_ACCOUNT`: Your AWS Account ID
- `HUGGINGFACE_HUB_TOKEN`: Your Hugging Face API token
- `OPENSEARCH_PASSWORD`: A secure password for OpenSearch

### 3. Hugging Face Setup

1. Create an account at [Hugging Face](https://huggingface.co/)
2. Navigate to your profile settings
3. Go to "Access Tokens" section
4. Generate a new token with appropriate permissions
5. Add the token to your `.env` file as `HUGGINGFACE_HUB_TOKEN`

### 4. AWS Bedrock Configuration

This application uses AWS Bedrock for embedding generation. You must manually request access:

1. Log into the **AWS Console**
2. Navigate to **Amazon Bedrock**
3. Go to **Model access** in the left sidebar
4. Request access to the required embedding models
5. Wait for approval (this may take some time)

**Note**: Bedrock availability varies by region. Ensure your selected region supports the required models.

## Deployment Commands

The application supports deployment to multiple environments using the scripts defined in `package.json`.

### Available Environments

- **dev**: Development environment
- **test**: Testing environment
- **prod**: Production environment
- **FTR**: Feature testing environment

### Deploy Commands

```bash
# Deploy to development
npm run deploy:dev

# Deploy to development with watch mode (auto-redeploy on changes)
npm run deploy:dev:watch

# Deploy to production
npm run deploy:prod

# Deploy to test environment
npm run deploy:test

# Deploy to FTR environment
npm run deploy:FTR
```

### Destroy Commands

```bash
# Destroy dev environment
npm run destroy:dev

# Destroy production environment
npm run destroy:prod

# Destroy test environment
npm run destroy:test

# Destroy FTR environment
npm run destroy:FTR
```

## Deployment Process

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
  - Update the `.env` file with your actual values
  - Ensure AWS credentials are configured

3. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

4. **Deploy to your chosen environment**:
   ```bash
   npm run deploy:dev  # or your preferred environment
   ```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_PREFIX` | Application prefix for resource naming | Yes |
| `CDK_DEFAULT_REGION` | AWS region for deployment | Yes |
| `CDK_DEFAULT_ACCOUNT` | Your AWS Account ID | Yes |
| `HUGGINGFACE_HUB_TOKEN` | Hugging Face API token | Yes |
| `OPENSEARCH_INDEX` | OpenSearch index name | Yes |
| `OPENSEARCH_USER` | OpenSearch master username | Yes |
| `OPENSEARCH_PASSWORD` | OpenSearch master password | Yes |

## Troubleshooting

### Common Issues

**CDK Bootstrap Error**:
```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

**Insufficient Permissions**:
Ensure your AWS credentials have the necessary permissions for:
- CloudFormation
- IAM
- Lambda
- OpenSearch
- Bedrock
- Other AWS services used by your application

**Bedrock Access Denied**:
Verify that you have requested and received access to Bedrock models in your deployment region.

**Environment Variables Not Found**:
Ensure the `.env` file is in the project root and contains all required variables.

## Security Notes

- Never commit the `.env` file to version control
- Use strong passwords for OpenSearch
- Regularly rotate your Hugging Face tokens
- Follow AWS security best practices for IAM roles and policies
- Consider using AWS Secrets Manager for sensitive configuration in production

## Clean Up

To avoid unnecessary AWS charges, remember to destroy environments when they're no longer needed:

```bash
npm run destroy:dev    # Replace with appropriate environment
```

This will remove all AWS resources created by the CDK deployment.
