import {
  signIn,
  signUp,
  performPasswordReset,
} from "@/lib/services/auth-service";
import { updatePatientRecord } from "@/lib/services/patient-service";
import { updateDentistProfile } from "@/lib/services/dentist-service";
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  patientRecordSchema,
  dentistProfileSchema,
} from "@/lib/validations/auth";
import { actionWrapper, ActionState } from "@/lib/utils";

export type AuthState = ActionState;

export async function signInAction(
  prevState: AuthState,
  data: FormData
): Promise<AuthState> {
  return actionWrapper(signInSchema, signIn, data);
}

export async function signUpAction(
  prevState: AuthState,
  data: FormData
): Promise<AuthState> {
  return actionWrapper(signUpSchema, signUp, data);
}

export async function resetPasswordAction(
  prevState: AuthState,
  data: FormData
): Promise<AuthState> {
  return actionWrapper(resetPasswordSchema, performPasswordReset, data);
}

export async function updatePatientRecordAction(
  prevState: AuthState,
  data: FormData
): Promise<AuthState> {
  // We need to get the current user's UID.
  // Since this runs on the client, we can import auth dynamically or assume the caller handles auth state.
  // Better pattern: The Service function handles the db write. We just need the UID.
  // Problem: FormData doesn't contain UID automatically.
  // Solution: The frontend form must include <input type="hidden" name="uid" value={user.uid} />
  // OR we use the current auth instance here since it's client side.

  const { auth } = await import("@/lib/firebase/firebase");
  if (!auth.currentUser) return { success: false, error: "Not authenticated" };

  return actionWrapper(
    patientRecordSchema,
    async (parsedData) => {
      return await updatePatientRecord(auth.currentUser!.uid, parsedData);
    },
    data
  );
}

export async function updateDentistProfileAction(
  prevState: AuthState,
  data: FormData
): Promise<AuthState> {
  const { auth } = await import("@/lib/firebase/firebase");
  if (!auth.currentUser) return { success: false, error: "Not authenticated" };

  return actionWrapper(
    dentistProfileSchema,
    async (parsedData) => {
      return await updateDentistProfile(auth.currentUser!.uid, parsedData);
    },
    data
  );
}
