import { signIn, signUp, performPasswordReset } from "@/lib/services/auth-service";
import { signInSchema, signUpSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { actionWrapper, ActionState } from "@/lib/utils";

export type AuthState = ActionState;

// Note: These actions run on the Client Side to ensure the browser session is set correctly.
// Do NOT add "use server" here.

export async function signInAction(prevState: AuthState, data: FormData): Promise<AuthState> {
  return actionWrapper(signInSchema, signIn, data);
}

export async function signUpAction(prevState: AuthState, data: FormData): Promise<AuthState> {
  return actionWrapper(signUpSchema, signUp, data);
}

export async function resetPasswordAction(prevState: AuthState, data: FormData): Promise<AuthState> {
  return actionWrapper(resetPasswordSchema, performPasswordReset, data);
}

