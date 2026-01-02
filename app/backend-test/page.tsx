"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createEmployeeAction } from "@/app/actions/admin-actions";

function CreateEmployeeForm() {
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [state, formAction, isPending] = useActionState(createEmployeeAction, {
    success: false,
  });

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken);
    }
  }, [user]);

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6">
      <h3 className="mb-4 text-lg font-bold text-indigo-900">
        Admin Panel: Add Employee
      </h3>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="idToken" value={token} />

        <div>
          <label className="block text-xs font-semibold uppercase text-indigo-800">
            Full Name
          </label>
          <input
            name="displayName"
            required
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-indigo-800">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-indigo-800">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-indigo-800">
            Role
          </label>
          <select name="role" className="w-full rounded border p-2 text-sm">
            <option value="dentist">Dentist</option>
            <option value="front-desk">Front Desk</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {state.success && (
          <p className="text-sm font-medium text-green-600">
            Employee created successfully!
          </p>
        )}
        {state.error && (
          <p className="text-sm font-medium text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded bg-indigo-700 py-2 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default function BackendTestPage() {
  const { user, role, loading, logout } = useAuth();

  // Debugging Logs
  useEffect(() => {
    console.log("BackendTestPage - Auth State:", { user, role, loading });
  }, [user, role, loading]);

  if (loading) {
    return (
      <div className="text-center text-gray-500">Checking auth status...</div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Not Logged In</h2>
          <p className="text-gray-500">
            Please sign in to access the test dashboard.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/backend-test/auth/signin"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Sign In
          </Link>
          <Link
            href="/backend-test/auth/signup"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* User Profile Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {role?.toUpperCase()}
          </span>
        </div>

        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              UID
            </label>
            <div className="font-mono text-sm">{user.uid}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Display Name
            </label>
            <div className="font-medium">{user.displayName || "Not set"}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Email
            </label>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Email Verified
            </label>
            <div
              className={
                user.emailVerified ? "text-green-600" : "text-amber-600"
              }
            >
              {user.emailVerified ? "Verified" : "Not Verified"}
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Section (Conditional) */}
      {role === "admin" && (
        <div>
          <CreateEmployeeForm />
        </div>
      )}
    </div>
  );
}
