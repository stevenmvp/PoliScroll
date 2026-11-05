import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from "aws-amplify/auth";
import type { AuthSession, UserProfile, UserRole } from "../domain/identity";

let configured = false;

export async function configureAmplify(): Promise<boolean> {
  if (configured) return true;

  const response = await fetch("/amplify_outputs.json", { cache: "no-store" });
  if (!response.ok) {
    console.error(`No se pudo cargar la configuración de Amplify (${response.status}).`);
    return false;
  }

  const outputs: unknown = await response.json();
  Amplify.configure(outputs as Parameters<typeof Amplify.configure>[0]);
  configured = true;
  return true;
}

function roleFromGroups(groups: string[] | undefined): UserRole {
  if (groups?.includes("admin")) return "admin";
  if (groups?.includes("teacher")) return "teacher";
  return "student";
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const user = await getCurrentUser();
    const [attributes, session] = await Promise.all([fetchUserAttributes(), fetchAuthSession()]);
    const groups = (session.tokens?.accessToken?.payload["cognito:groups"] as string[] | undefined) ?? [];
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: user.userId,
      email: attributes.email ?? user.username,
      displayName: attributes.name ?? attributes.email ?? user.username,
      role: roleFromGroups(groups),
      status: "active",
      interests: [],
      createdAt: now,
      updatedAt: now,
    };

    return {
      user: profile,
      expiresAt: session.tokens?.accessToken?.payload.exp
        ? new Date(session.tokens.accessToken.payload.exp * 1000).toISOString()
        : now,
    };
  } catch {
    return null;
  }
}

export async function register(email: string, password: string, displayName: string): Promise<string | null> {
  const result = await signUp({
    username: email,
    password,
    options: { userAttributes: { email, name: displayName } },
  });
  return result.nextStep.signUpStep === "CONFIRM_SIGN_UP" ? email : null;
}

export async function confirmRegistration(email: string, code: string): Promise<void> {
  await confirmSignUp({ username: email, confirmationCode: code });
}

export async function login(email: string, password: string): Promise<void> {
  await signIn({ username: email, password });
}

export async function logout(): Promise<void> {
  await signOut();
}

export async function beginPasswordReset(email: string): Promise<void> {
  await resetPassword({ username: email });
}

export async function finishPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
  await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await updatePassword({ oldPassword, newPassword });
}
