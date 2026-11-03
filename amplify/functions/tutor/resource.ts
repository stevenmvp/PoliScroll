import { defineFunction, secret } from "@aws-amplify/backend";

export const tutor = defineFunction({
  name: "poliscroll-tutor",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    GEMINI_API_KEY: secret("GEMINI_API_KEY"),
  },
});
