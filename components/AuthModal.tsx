"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth-actions";

type State = { success: boolean; error?: unknown };

function normalizeError(err: unknown) {
  if (!err) return "";
  if (Array.isArray(err)) return err.join(", ");
  if (typeof err === "string") {
    try {
      return JSON.parse(err);
    } catch {
      return err;
    }
  }
  if (typeof err === "object") return JSON.stringify(err);
  return String(err);
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState<State, FormData>(signInAction, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  const errorText = useMemo(() => normalizeError(state?.error), [state?.error]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Log in</h2>
        <p className="mt-1 text-sm text-slate-600">
          Access your appointments and account.
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
        />

        <button
          type="submit"
          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          style={{ backgroundColor: "#0E4B5A" }}
        >
          Log in
        </button>
      </form>

      {!!errorText && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText}
        </div>
      )}
    </div>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState<State, FormData>(signUpAction, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  const errorText = useMemo(() => normalizeError(state?.error), [state?.error]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Sign up</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create an account to manage appointments.
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
        />

        <button
          type="submit"
          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          style={{ backgroundColor: "#0E4B5A" }}
        >
          Create account
        </button>
      </form>

      {!!errorText && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText}
        </div>
      )}
    </div>
  );
}

export default function AuthModal({
  open,
  onClose,
  defaultTab = "login",
}: {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);

  useEffect(() => {
    if (open && tab !== defaultTab) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTab(defaultTab);
    }
  }, [open, defaultTab, tab]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSuccess = () => {
    onClose();
    router.push("/client-dashboard");
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("login")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === "login"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === "signup"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Sign up
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-6">
            {tab === "login" ? (
              <SignInForm onSuccess={handleSuccess} />
            ) : (
              <SignUpForm onSuccess={handleSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
