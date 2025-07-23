import json
from sagemaker import Session
import boto3
from sagemaker.huggingface import HuggingFaceModel, get_huggingface_llm_image_uri
from sagemaker.async_inference import AsyncInferenceConfig
from typing import Dict, Any
from aws_lambda_powertools import Logger
import os

logger = Logger(service="deploy model")

ROLE_ARN = os.environ.get('ROLE_ARN')
HUGGINGFACE_HUB_TOKEN = os.environ['HUGGINGFACE_HUB_TOKEN']
ENDPOINT_NAME = os.environ.get('ENDPOINT_NAME')
MODEL_NAME = os.environ.get('MODEL_NAME')
HF_MODEL_ID = os.environ.get('HF_MODEL_ID')
INSTANCE_TYPE = os.environ.get('INSTANCE_TYPE')
INSTANCE_COUNT = os.environ.get('INSTANCE_COUNT')
INFERENCE_TYPE = os.environ.get('INFERENCE_TYPE', 'SYNC')  # Default to SYNC if not specified

# Async inference specific environment variables
ASYNC_S3_BUCKET = os.environ.get('ASYNC_S3_BUCKET')  # S3 bucket for async inference
ASYNC_SNS_TOPIC = os.environ.get('ASYNC_SNS_TOPIC')  # Optional SNS topic for notifications

# Global Boto3 session
boto_session = boto3.Session()
sagemaker_session = Session(boto_session)

def delete_existing_model(model_name):
    try:
        sagemaker_session.delete_model(model_name)
        print(f"Deleted existing model: {model_name}")
    except Exception as e:
        print(f"No existing model named {model_name} found. Exception: {str(e)}")

def delete_existing_endpoint(endpoint_name):
    try:
        sagemaker_session.delete_endpoint(endpoint_name)
        print(f"Deleted existing endpoint: {endpoint_name}")
    except Exception as e:
        print(f"No existing endpoint named {endpoint_name} found. Exception: {str(e)}")

def delete_existing_endpoint_config(endpoint_config_name):
    try:
        sagemaker_session.delete_endpoint_config(endpoint_config_name)
        print(f"Deleted existing endpoint configuration: {endpoint_config_name}")
    except Exception as e:
        print(f"No existing endpoint configuration named {endpoint_config_name} found. Exception: {str(e)}")

def create_async_inference_config():
    """Create AsyncInferenceConfig for async inference endpoints."""
    if not ASYNC_S3_BUCKET:
        raise ValueError("ASYNC_S3_BUCKET environment variable is required for async inference")

    s3_output_path = f"s3://{ASYNC_S3_BUCKET}/output"
    s3_error_path = f"s3://{ASYNC_S3_BUCKET}/error"

    # Create notification config if SNS topic is provided
    notification_config = {}
    if ASYNC_SNS_TOPIC:
        notification_config = {
            "SuccessTopic": ASYNC_SNS_TOPIC,
            "ErrorTopic": ASYNC_SNS_TOPIC
        }

    async_config = AsyncInferenceConfig(
        output_path=s3_output_path,
        max_concurrent_invocations_per_instance=4,
        notification_config=notification_config if notification_config else None,
        failure_path=s3_error_path,
    )

    logger.info(f"Created async inference config with output path: {s3_output_path}")
    return async_config

def deploy_model_sync(role: str, huggingface_model: HuggingFaceModel) -> None:
    """Deploy model for synchronous inference."""
    logger.info("Deploying model for synchronous inference")

    predictor = huggingface_model.deploy(
        initial_instance_count=int(INSTANCE_COUNT),
        instance_type=INSTANCE_TYPE,
        endpoint_name=ENDPOINT_NAME,
    )
    logger.info("Synchronous model deployed successfully")

    # Test the endpoint with a sample request
    test_sync_endpoint(predictor)

def deploy_model_async(role: str, huggingface_model: HuggingFaceModel) -> None:
    """Deploy model for asynchronous inference."""
    logger.info("Deploying model for asynchronous inference")

    async_config = create_async_inference_config()

    predictor = huggingface_model.deploy(
        initial_instance_count=int(INSTANCE_COUNT),
        instance_type=INSTANCE_TYPE,
        endpoint_name=ENDPOINT_NAME,
        async_inference_config=async_config
    )
    logger.info("Asynchronous model deployed successfully")

    # Test the endpoint with a sample request
    test_async_endpoint(predictor)

def test_sync_endpoint(predictor):
    """Test synchronous endpoint with a sample request."""
    try:
        response = predictor.predict(
            {
                "inputs": "What is the capital of France?",
                "parameters": {
                    "do_sample": True,
                    "max_new_tokens": 128,
                    "temperature": 0.7,
                    "top_k": 50,
                    "top_p": 0.95,
                }
            }
        )
        logger.info(f"Sync endpoint test successful: {response}")
    except Exception as e:
        logger.error(f"Sync endpoint test failed: {e}")
        raise

def test_async_endpoint(predictor):
    """Test asynchronous endpoint with a sample request."""
    try:
        # For async endpoints, predict returns a response with the invocation output location
        response = predictor.predict_async(
            {
                "inputs": "What is the capital of France?",
                "parameters": {
                    "do_sample": True,
                    "max_new_tokens": 128,
                    "temperature": 0.7,
                    "top_k": 50,
                    "top_p": 0.95,
                }
            }
        )
        logger.info(f"Async endpoint test initiated: {response}")
    except Exception as e:
        logger.error(f"Async endpoint test failed: {e}")
        raise

def deploy_model(role: str) -> None:
    """Deploy model to SageMaker Inference (Sync or Async based on INFERENCE_TYPE)."""
    try:
        # Validate inference type
        if INFERENCE_TYPE not in ['SYNC', 'ASYNC']:
            raise ValueError(f"Invalid INFERENCE_TYPE: {INFERENCE_TYPE}. Must be 'SYNC' or 'ASYNC'")

        # Hub Model configuration
        hub = {
            'HF_MODEL_ID': HF_MODEL_ID,
            'SM_NUM_GPUS': json.dumps(1),
        }

        logger.info(f"deploy_model: {hub}")
        logger.info(f"Inference type: {INFERENCE_TYPE}")

        image_uri = get_huggingface_llm_image_uri("huggingface", version="3.2.3")

        # Create Hugging Face Model Class
        huggingface_model = HuggingFaceModel(
            image_uri=image_uri,
            env=hub,
            role=role,
            name=MODEL_NAME
        )
        logger.info(f"huggingface_model: {huggingface_model}")

        # Deploy based on inference type
        if INFERENCE_TYPE == 'SYNC':
            deploy_model_sync(role, huggingface_model)
        else:  # ASYNC
            deploy_model_async(role, huggingface_model)

    except Exception as e:
        logger.error(f"Error deploying model: {e}")
        raise

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        logger.info(f"Received event: {event}")
        logger.info(f"MODEL_NAME: {MODEL_NAME}")
        logger.info(f"ENDPOINT_NAME: {ENDPOINT_NAME}")
        logger.info(f"HF_MODEL_ID: {HF_MODEL_ID}")
        logger.info(f"ROLE_ARN: {ROLE_ARN}")
        logger.info(f"HUGGINGFACE_HUB_TOKEN: {HUGGINGFACE_HUB_TOKEN}")
        logger.info(f"INSTANCE_TYPE: {INSTANCE_TYPE}")
        logger.info(f"INSTANCE_COUNT: {INSTANCE_COUNT}")
        logger.info(f"INFERENCE_TYPE: {INFERENCE_TYPE}")

        if INFERENCE_TYPE == 'ASYNC':
            logger.info(f"ASYNC_S3_BUCKET: {ASYNC_S3_BUCKET}")
            logger.info(f"ASYNC_SNS_TOPIC: {ASYNC_SNS_TOPIC}")

        request_type = event['RequestType']

        try:
            role = ROLE_ARN
        except ValueError:
            iam = boto3.client('iam')
            role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

        if request_type == 'Create':
            deploy_model(role)
            logger.info("Create action completed")

        elif request_type == 'Delete':
            delete_existing_model(MODEL_NAME)
            delete_existing_endpoint(ENDPOINT_NAME)
            delete_existing_endpoint_config(ENDPOINT_NAME)
            logger.info("Delete action completed")

        return {
            'Status': 'SUCCESS',
            'Reason': f'Successfully processed {request_type} request',
            'PhysicalResourceId': ENDPOINT_NAME,
            'Data': {
                'EndpointName': ENDPOINT_NAME,
                'ModelName': MODEL_NAME,
                'InferenceType': INFERENCE_TYPE
            }
        }

    except Exception as e:
        logger.error(f"Failed: {str(e)}")
        return {
            'Status': 'FAILED',
            'Reason': str(e),
            'PhysicalResourceId': ENDPOINT_NAME or 'unknown',
            'Data': {}
        }
