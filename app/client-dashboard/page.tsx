
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Appointment = {
  id: string;
  doctor: string;
  date: string;
  type: "Online" | "Clinic Visit";
  status: "Upcoming" | "Completed" | "Cancelled";
};

type Message = {
  id: string;
  from: string;
  subject: string;
  time: string;
  unread?: boolean;
};

const BRAND = "#0E4B5A";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs text-slate-500">{hint}</p>
      ) : (
        <div className="mt-4 h-2 w-24 rounded-full bg-slate-100" />
      )}
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "green" | "gray" | "red" | "blue";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "blue"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function statusTone(s: Appointment["status"]): "green" | "gray" | "red" | "blue" {
  if (s === "Upcoming") return "blue";
  if (s === "Completed") return "green";
  if (s === "Cancelled") return "red";
  return "gray";
}

export default function ClientDashboardPage() {
  const [active, setActive] = useState<"dashboard" | "settings">("dashboard");

  const patient = useMemo(
    () => ({
      name: "Karl Moses",
      memberId: "PT-10294",
      avatar: "/clinic6.jpg", //sample rani bitch
    }),
    []
  );

  const appointments: Appointment[] = useMemo(
    () => [
      {
        id: "A-1001",
        doctor: "Dr. Andrea Santos",
        date: "2026-01-05 • 10:30 AM",
        type: "Clinic Visit",
        status: "Upcoming",
      },
      {
        id: "A-0991",
        doctor: "Dr. Miguel Reyes",
        date: "2025-12-18 • 2:00 PM",
        type: "Online",
        status: "Completed",
      },
      {
        id: "A-0974",
        doctor: "Dr. Aria Rahman",
        date: "2025-11-28 • 9:15 AM",
        type: "Clinic Visit",
        status: "Cancelled",
      },
    ],
    []
  );

  const inbox: Message[] = useMemo(
    () => [
      {
        id: "M-1",
        from: "J4 Dental Clinic",
        subject: "Reminder: Bring your valid ID for your appointment.",
        time: "1:35 PM",
        unread: true,
      },
      {
        id: "M-2",
        from: "Reception",
        subject: "Your appointment has been confirmed.",
        time: "11:10 AM",
        unread: false,
      },
      {
        id: "M-3",
        from: "Billing",
        subject: "Receipt is ready for download.",
        time: "Yesterday",
        unread: false,
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* LEFT SIDEBAR */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/dclogo.png"
                    alt="J4 Dental Clinic"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-slate-900">
                    Patient Portal
                  </p>
                  <p className="text-xs text-slate-500">J4 Dental Clinic</p>
                </div>
              </div>
            </div>

            <nav className="p-3">
              <button
                onClick={() => setActive("dashboard")}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active === "dashboard"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActive("settings")}
                className={`mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active === "settings"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Account Settings
              </button>

              <div className="my-3 border-t border-slate-100" />

              <Link
                href="/"
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </Link>
            </nav>

            <div className="p-5 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Need help? Contact the clinic for assistance.
              </p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="space-y-6">
            {/* TOP PATIENT CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div
                className="p-6"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(14,75,90,1) 0%, rgba(27,166,200,1) 100%)",
                }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
                      <Image
                        src={patient.avatar}
                        alt={patient.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="text-white">
                      <p className="text-xs font-semibold text-white/85">
                        Patient Dashboard
                      </p>
                      <h1 className="mt-1 text-xl font-extrabold">
                        {patient.name}
                      </h1>
                      <p className="mt-1 text-xs text-white/80">
                        Member ID: {patient.memberId}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
                      View Profile
                    </button>
                    <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                      Message Clinic
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <StatCard
                    label="Upcoming Appointments"
                    value={String(appointments.filter((a) => a.status === "Upcoming").length)}
                    hint="This month"
                  />
                  <StatCard label="Completed Visits" value="6" hint="Last 90 days" />
                  <StatCard label="Prescriptions" value="2" hint="Active" />
                  <StatCard label="Total Points" value="1,240" hint="Rewards" />
                </div>
              </div>
            </div>

            {/* DASHBOARD VIEW */}
            {active === "dashboard" && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                {/* APPOINTMENT HISTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">
                        Appointment History
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Your upcoming and past appointments.
                      </p>
                    </div>

                    <button
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
                      style={{ backgroundColor: BRAND }}
                      onClick={() => alert("Open create appointment modal (next step).")}
                    >
                      <span className="text-lg leading-none">+</span>
                      Add Appointment
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Appointment Name</th>
                          <th className="px-6 py-3">Appointment Type</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/60">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">
                                {a.doctor}
                              </div>
                              <div className="text-xs text-slate-500">
                                Ref: {a.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-700">{a.type}</td>
                            <td className="px-6 py-4 text-slate-700">{a.date}</td>
                            <td className="px-6 py-4">
                              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                  View
                                </button>
                                {a.status === "Upcoming" && (
                                  <button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* INBOX */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-sm font-extrabold text-slate-900">Inbox</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Updates from the clinic.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {inbox.map((m) => (
                      <button
                        key={m.id}
                        className="w-full px-6 py-4 text-left hover:bg-slate-50/60"
                        onClick={() => alert(`Open message: ${m.subject}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {m.from}
                              </p>
                              {m.unread && (
                                <span className="h-2 w-2 rounded-full bg-sky-500" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                              {m.subject}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 whitespace-nowrap">
                            {m.time}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="px-6 py-4">
                    <button className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                      View all messages
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS VIEW */}
            {active === "settings" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Account Settings
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage your profile and account preferences.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Profile Information
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Update your basic account details.
                      </p>

                      <div className="mt-4 space-y-3">
                        <input
                          defaultValue={patient.name}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-300"
                          placeholder="Full name"
                        />
                        <input
                          defaultValue="karl@example.com"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-300"
                          placeholder="Email"
                        />
                        <button
                          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                          style={{ backgroundColor: BRAND }}
                          onClick={() => alert("Save profile (hook to API next).")}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Security
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Change your password for better security.
                      </p>

                      <div className="mt-4 space-y-3">
                        <input
                          type="password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-300"
                          placeholder="Current password"
                        />
                        <input
                          type="password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-300"
                          placeholder="New password"
                        />
                        <input
                          type="password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-300"
                          placeholder="Confirm new password"
                        />
                        <button
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                          onClick={() => alert("Update password (hook to API next).")}
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Notifications
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Choose which updates you want to receive.
                    </p>

                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                        <span>Email reminders for appointments</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                        <span>Clinic announcements and promos</span>
                        <input type="checkbox" />
                      </label>
                    </div>

                    <div className="mt-4">
                      <button
                        className="rounded-xl px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
                        style={{ backgroundColor: BRAND }}
                        onClick={() => alert("Save notification prefs (hook to API next).")}
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
