"use client";

import { signInAction } from "../actions/auth-actions";
import { useFormState } from "react-dom";

type State = {
  success: boolean;
  error?: string;
};

export default function SignInPage() {
  const [state, formAction] = useFormState<State, FormData>(signInAction, {
    success: false,
    error: undefined,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form action={formAction} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-40"
        >
          Sign In
        </button>
      </form>
      {state.success && (
        <p className="text-green-500">Signed in successfully!</p>
      )}
      {state.error && (
        <p className="text-red-500">{JSON.stringify(state.error)}</p>
      )}
    </div>
  );
}
