'use server';

import { signIn } from '@/lib/services/auth-service';
import { signInSchema } from '@/lib/validations/auth';

export async function signInAction(prevState: any, data: FormData) {
  const formData = Object.fromEntries(data);
  const parsed = signInSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: JSON.stringify(parsed.error.flatten().fieldErrors),
    };
  }

  return await signIn(parsed.data);
}
