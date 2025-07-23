import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { generateUsername } from '../../../../shared/helpers';
import { errorHandler } from '../../../../shared/services/Errors';

const cognito = new CognitoIdentityProviderClient({});

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  try {
    const { RequestType, ResourceProperties } = event;
    const { UserPoolId, Email, FamilyName, GivenName, UserRole, CreatedByName, CreatedByRole } = ResourceProperties;
    const Username = generateUsername(FamilyName, GivenName);

    console.log('Request type: ', RequestType);

    console.log(`Initiated admin user creation for: 
    user pool: ${UserPoolId},
    userName: ${Username},
    userRole: ${UserRole},
    `,
    );

    if (RequestType === 'Create') {
      console.log('User processing');

      const userId = uuid();

      // Create user
      const cognitoUser = await cognito.send(new AdminCreateUserCommand({
        UserPoolId,
        Username,
        UserAttributes: [
          { Name: 'email', Value: Email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'family_name', Value: FamilyName },
          { Name: 'given_name', Value: GivenName },
          { Name: 'custom:userRole', Value: UserRole },
          { Name: 'custom:userId', Value: userId },
          { Name: 'custom:createdById', Value: userId },
          { Name: 'custom:createdAt', Value: new Date().toISOString() },
          { Name: 'custom:createdByName', Value: CreatedByName },
          { Name: 'custom:createdByRole', Value: CreatedByRole },
        ],
      }));

      console.log('User created');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Admin User was successfully created' }),
    };
  } catch (e) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
