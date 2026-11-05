import { defineFunction } from "@aws-amplify/backend";

export const tutor = defineFunction({
  name: "poliscroll-tutor",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});
