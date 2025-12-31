"use server";

import { signIn, signUp } from "@/lib/services/auth-service";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

export type AuthState = {
  success: boolean;
  error?: string;
};

export async function signInAction(prevState: AuthState, data: FormData): Promise<AuthState> {
  const formData = Object.fromEntries(data);
  const parsed = signInSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  return await signIn(parsed.data);
}

export async function signUpAction(prevState: AuthState, data: FormData): Promise<AuthState> {
  const formData = Object.fromEntries(data);
  const parsed = signUpSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  return await signUp(parsed.data);
}
