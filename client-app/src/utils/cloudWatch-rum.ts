import { AwsRum, AwsRumConfig } from 'aws-rum-web'

export function initCloudWatchRum() {
  try {
    const APPLICATION_ID: string = import.meta.env.VITE_CLOUDWATCH_RUM_APPLICATION_ID

    if (!APPLICATION_ID) {
      return
    }

    const config: AwsRumConfig = {
      sessionSampleRate: 1,
      identityPoolId: import.meta.env.VITE_CLOUDWATCH_RUM_IDENTITY_POOL_ID!,
      endpoint: import.meta.env.VITE_CLOUDWATCH_RUM_ENDPOINT!,
      telemetries: ['performance', 'errors', 'http'],
      allowCookies: true,
      enableXRay: false,
    }

    const APPLICATION_VERSION: string = '1.0.0'
    const APPLICATION_REGION: string = import.meta.env.VITE_CLOUDWATCH_RUM_APPLICATION_REGION

    new AwsRum(APPLICATION_ID, APPLICATION_VERSION, APPLICATION_REGION, config)
  } catch (error) {
    console.log('Error initializing CloudWatch RUM:', error)
  }
}
