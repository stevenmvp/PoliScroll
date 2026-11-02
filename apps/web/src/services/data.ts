import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import type { AuthSession } from "../domain/identity";

const client = generateClient<Schema>();

export async function ensureUserProfile(session: AuthSession): Promise<void> {
  const profiles = await client.models.UserProfile.list({
    filter: { owner: { eq: session.user.id } },
    limit: 1,
  });

  if (profiles.errors?.length) {
    throw new Error("No se pudo consultar el perfil del usuario.");
  }
  if (profiles.data[0]) return;

  const result = await client.models.UserProfile.create({
    displayName: session.user.displayName,
    email: session.user.email,
    role: session.user.role === "super_admin" ? "super_admin" : session.user.role,
    status: "active",
    interests: [],
  });

  if (result.errors?.length) {
    throw new Error("No se pudo crear el perfil del usuario.");
  }
}
