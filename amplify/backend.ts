import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { tutor } from "./functions/tutor/resource.js";

const backend = defineBackend({ auth, data, tutor });

backend.tutor.resources.lambda.addToRolePolicy(new PolicyStatement({
  actions: ["bedrock:InvokeModel"],
  resources: ["arn:aws:bedrock:*::foundation-model/amazon.nova-*", "arn:aws:bedrock:*:*:inference-profile/us.amazon.nova-*"],
}));
