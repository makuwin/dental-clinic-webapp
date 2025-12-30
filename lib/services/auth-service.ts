import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { signInSchema } from "../validations/auth";
import { z } from "zod";

export async function signIn(credentials: z.infer<typeof signInSchema>) {
  try {
    const { email, password } = signInSchema.parse(credentials);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}
