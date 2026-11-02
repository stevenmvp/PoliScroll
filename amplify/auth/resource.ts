import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  groups: ["student", "teacher", "admin"],
  loginWith: {
    email: true,
  },
});
