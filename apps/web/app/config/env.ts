export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "PoliScroll",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.example.com",
  cognito: {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION ?? "us-east-1",
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
    redirectSignIn: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ?? "http://localhost:3000",
    redirectSignOut: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ?? "http://localhost:3000",
    responseType: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE ?? "code",
  },
  pwaEnabled: process.env.NEXT_PUBLIC_ENABLE_PWA === "true",
};

export const isCognitoConfigured = Boolean(
  env.cognito.userPoolId && env.cognito.clientId && env.cognito.region,
);
