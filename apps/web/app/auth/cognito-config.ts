export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_COGNITO_REGION ?? "us-east-1",
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
  redirectSignIn: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ?? "http://localhost:3000",
  redirectSignOut: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ?? "http://localhost:3000",
  responseType: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE ?? "code",
};

export const isCognitoReady = Boolean(
  cognitoConfig.userPoolId && cognitoConfig.clientId && cognitoConfig.region,
);
