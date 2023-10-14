import AWS, { CognitoIdentityServiceProvider } from "aws-sdk";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import dotenv from "dotenv";

dotenv.config();

const verifierToken = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID as string,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID as string,
});

const AWSCredentials: { [key: string]: string } = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
};

const initAWS = () => {
  AWS.config.region = process.env.AWS_COGNITO_REGION;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID as string,
  });
};

const awsSignIn = async (email: string, password: string) => {
  try {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
      AWSCredentials
    );
    const params: CognitoIdentityServiceProvider.InitiateAuthRequest = {
      ClientId: process.env.COGNITO_CLIENT_ID as string,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    return cognitoIdentityServiceProvider.initiateAuth(params).promise()
      .then((data: CognitoIdentityServiceProvider.InitiateAuthResponse) => {
        return data;
      }).catch((error: AWS.AWSError) => {
        throw error;
      });

  } catch (error) {
    throw error;
  }
};

const adminGetUser = async (email: string) => {
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider(AWSCredentials);
    const params: CognitoIdentityServiceProvider.AdminGetUserRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: email,
    };
    const user: CognitoIdentityServiceProvider.AdminGetUserResponse =
      await cognitoIdentityServiceProvider.adminGetUser(params).promise();
    return user;
  } catch (error) {
    throw error;
  }
};

const adminCreateUser = async (email: string, password: string, user_id: number) => {
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider(AWSCredentials);

    const attributes: CognitoIdentityServiceProvider.AttributeListType = [
      {
        Name: "custom:user_id",
        Value: user_id.toString(),
      },
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ];

    const params: CognitoIdentityServiceProvider.AdminCreateUserRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: email,
      TemporaryPassword: password,
      MessageAction: "SUPPRESS",
      UserAttributes: attributes,
    };
    return await cognitoIdentityServiceProvider
      .adminCreateUser(params)
      .promise();
  } catch (error) {
    throw error;
  }
};

const adminConfirmSignUp = async (username: string) => {
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider(AWSCredentials);
    const params: CognitoIdentityServiceProvider.AdminConfirmSignUpRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: username,
    };

    return await cognitoIdentityServiceProvider
      .adminConfirmSignUp(params)
      .promise();
  } catch (error) {
    throw error;
  }
};

const adminUpdatePassword = async (username: string, newPassword: string) => {
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider(AWSCredentials);
    const params: CognitoIdentityServiceProvider.AdminSetUserPasswordRequest = {
      Password: newPassword,
      Permanent: true,
      Username: username,
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
    };

    return await cognitoIdentityServiceProvider
      .adminSetUserPassword(params)
      .promise();
  } catch (error) {
    throw error;
  }
};

const updateUserAttributes = async (
  username: string,
  attributes: CognitoIdentityServiceProvider.AttributeListType
) => {
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider(AWSCredentials);
    const params: CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest =
      {
        UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
        Username: username,
        UserAttributes: attributes,
      };

    return await cognitoIdentityServiceProvider
      .adminUpdateUserAttributes(params)
      .promise();
  } catch (error) {
    throw error;
  }
};

const verifyJWTToken = async (token: string) => {
  try {
    return await verifierToken.verify(token);
  } catch (error) {
    throw error;
  }
};

export default {
  awsSignIn,
  initAWS,
  adminGetUser,
  verifyJWTToken,
  adminCreateUser,
  adminConfirmSignUp,
  adminUpdatePassword,
  updateUserAttributes,
};
