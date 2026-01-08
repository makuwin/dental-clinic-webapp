"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createEmployeeAction } from "@/app/actions/admin-actions";
import { updatePatientRecordAction } from "@/app/actions/auth-actions";
import {
  bookAppointmentAction,
  getAvailabilityAction,
  getClinicScheduleAction,
  updateAppointmentStatusAction,
  CalendarAvailability,
  AppointmentWithPatient,
} from "@/app/actions/appointment-actions";
import { getPatientRecord } from "@/lib/services/patient-service";
import { getUserAppointments } from "@/lib/services/appointment-service";
import { searchPatients, getUserProfile } from "@/lib/services/user-service";
import { PatientRecord } from "@/lib/types/patient";
import { Appointment, AppointmentStatus } from "@/lib/types/appointment";
import { UserProfile } from "@/lib/types/user";

function HistorySection() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserAppointments(user.uid).then((res) => {
        if (res.success) setAppointments(res.data || []);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">
        My Appointment History
      </h3>
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No appointments booked yet.
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="flex justify-between items-center p-3 border rounded bg-gray-50"
            >
              <div>
                <p className="font-bold text-sm text-gray-800">
                  {app.serviceType}
                </p>
                <p className="text-xs text-gray-600">
                  {app.date} @ {app.time}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                  app.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingSection() {
  const { user } = useAuth();
  const [state, formAction, isPending] = useActionState(bookAppointmentAction, {
    success: false,
  });
  const [availability, setAvailability] = useState<CalendarAvailability | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (selectedDate) {
      getAvailabilityAction(selectedDate).then((data) => setAvailability(data));
    }
  }, [selectedDate]);

  return (
    <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-6">
      <h3 className="text-lg font-bold text-blue-900">Book an Appointment</h3>

      <form action={formAction} className="space-y-3">
        {!user?.displayName && (
          <input
            name="displayName"
            placeholder="Your Full Name"
            required
            className="w-full p-2 border rounded text-sm"
          />
        )}

        <select
          name="serviceType"
          required
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Select Service</option>
          <option value="General Checkup">General Checkup</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Tooth Extraction">Tooth Extraction</option>
          <option value="Emergency">Emergency Case</option>
        </select>

        <input
          name="date"
          type="date"
          required
          className="w-full p-2 border rounded text-sm"
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {availability?.isHoliday && (
          <p className="text-xs font-bold text-red-600">
            Clinic is closed: {availability.holidayReason}
          </p>
        )}

        <select
          name="time"
          required
          className="w-full p-2 border rounded text-sm"
          disabled={availability?.isHoliday}
        >
          <option value="">Select Time</option>
          {[
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
          ].map((t) => (
            <option
              key={t}
              value={t}
              disabled={availability?.takenSlots.includes(t)}
            >
              {t} {availability?.takenSlots.includes(t) ? "(Booked)" : ""}
            </option>
          ))}
        </select>

        <textarea
          name="notes"
          placeholder="Additional notes..."
          className="w-full p-2 border rounded text-sm h-20"
        />

        <button
          disabled={isPending || availability?.isHoliday}
          className="w-full bg-blue-700 text-white py-2 rounded font-bold hover:bg-blue-800 disabled:opacity-50"
        >
          {isPending ? "Booking..." : "Submit Booking Request"}
        </button>

        {state.success && (
          <p className="text-green-600 text-sm font-bold text-center">
            Appointment requested!
          </p>
        )}
        {state.error && (
          <p className="text-red-600 text-sm font-bold text-center">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}

function PatientSection({
  externalTargetUid,
  setExternalTargetUid,
}: {
  externalTargetUid?: string;
  setExternalTargetUid?: (uid: string) => void;
}) {
  const { user, role } = useAuth();
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(
    updatePatientRecordAction,
    { success: false }
  );

  // Search / Combobox State
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  // We use the prop if available, otherwise local state (for standalone usage if needed, though we'll lift it all)
  // Actually, let's strictly use the prop if provided to avoid sync issues.
  const [localTargetUid, setLocalTargetUid] = useState<string>("");

  const targetUid =
    externalTargetUid !== undefined ? externalTargetUid : localTargetUid;
  const setTargetUid = setExternalTargetUid || setLocalTargetUid;

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Display Name State (Fetched from User Profile)
  const [displayName, setDisplayName] = useState("");

  const isStaff = role && role !== "client";

  // Debounced Search Effect
  useEffect(() => {
    if (!isStaff || !searchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchPatients(searchQuery);
      if (res.success) setSearchResults(res.data || []);
      setIsSearching(false);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isStaff]);

  // Load record when user OR targetUid changes
  useEffect(() => {
    const uidToFetch = targetUid || user?.uid;
    if (uidToFetch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);

      Promise.all([
        getPatientRecord(uidToFetch),
        getUserProfile(uidToFetch),
      ]).then(([recordRes, profileRes]) => {
        if (recordRes.success) setRecord(recordRes.data || null);
        if (profileRes.success && profileRes.data)
          setDisplayName(profileRes.data.displayName || "");
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetUid, state.success]);

  const selectPatient = (u: UserProfile) => {
    setTargetUid(u.uid);
    setSearchQuery(u.email);
    setShowDropdown(false);
  };

  if (loading && !targetUid) return <div>Loading record...</div>;

  return (
    <div className="space-y-4 rounded-lg border border-green-100 bg-green-50 p-6">
      <h3 className="text-lg font-bold text-green-900">
        Patient Record: {isStaff ? "Staff View" : "My Profile"}
      </h3>

      {isStaff && (
        <div className="relative mb-6">
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Search Patient
          </label>
          <div className="relative">
            <input
              className="w-full border p-2 text-sm rounded shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Type name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <li
                  key={u.uid}
                  className="cursor-pointer p-2 hover:bg-green-50 text-sm border-b last:border-0"
                  onClick={() => selectPatient(u)}
                >
                  <div className="font-bold">
                    {u.displayName || "Unknown Name"}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </li>
              ))}
            </ul>
          )}

          {targetUid && targetUid !== user?.uid && (
            <p className="text-xs text-green-700 mt-1 font-semibold">
              ✏️ Editing:{" "}
              {searchResults.find((u) => u.uid === targetUid)?.displayName ||
                targetUid}
            </p>
          )}
        </div>
      )}

      {record && (
        <div className="text-sm space-y-1 mb-4">
          <p>
            <strong>Name:</strong> {displayName}
          </p>
          <p>
            <strong>Phone:</strong> {record.phoneNumber}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {record.isProfileComplete ? "✅ Complete" : "⚠️ Incomplete"}
          </p>
          {isStaff && record.dateOfBirth && (
            <p>
              <strong>DOB:</strong> {record.dateOfBirth}
            </p>
          )}
        </div>
      )}
      <form action={formAction} className="space-y-2">
        <input
          type="hidden"
          name="targetUid"
          value={targetUid || user?.uid || ""}
        />

        <label className="block text-xs font-bold text-green-800">
          Display Name
        </label>
        <input
          name="displayName"
          placeholder="Full Name"
          className="w-full p-2 border rounded text-sm"
          defaultValue={displayName}
          key={displayName}
        />

        <label className="block text-xs font-bold text-green-800 mt-2">
          Phone Number (Patient Accessible)
        </label>
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          className="w-full p-2 border rounded text-sm"
          defaultValue={record?.phoneNumber}
        />

        {isStaff && (
          <div className="pt-2 border-t mt-2 space-y-2">
            <p className="text-xs font-bold text-red-800 italic">
              Clinical Details (Staff Only)
            </p>
            <input
              name="dateOfBirth"
              type="date"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.dateOfBirth}
            />
            <select
              name="gender"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.gender || "male"}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              name="address"
              placeholder="Address"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.address}
            />
            <input
              name="emergencyContact"
              placeholder="Emergency Contact"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.emergencyContact}
            />
            <p className="text-xs font-bold text-green-800 mt-2">
              Medical History
            </p>
            <input
              name="allergies"
              placeholder="Allergies (comma separated)"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.medicalHistory?.allergies?.join(", ")}
            />
            <input
              name="conditions"
              placeholder="Conditions (comma separated)"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.medicalHistory?.conditions?.join(", ")}
            />
            <textarea
              name="medications"
              placeholder="Medications"
              className="w-full p-2 border rounded text-sm h-16"
              defaultValue={record?.medicalHistory?.medications}
            />
          </div>
        )}

        <button
          disabled={isPending}
          className="w-full bg-green-700 text-white py-2 rounded font-bold hover:bg-green-800"
        >
          {isPending ? "Updating..." : "Save Record"}
        </button>
      </form>
    </div>
  );
}

function CreateEmployeeForm() {
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [state, formAction, isPending] = useActionState(createEmployeeAction, {
    success: false,
  });

  useEffect(() => {
    if (user) user.getIdToken().then(setToken);
  }, [user]);

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6">
      <h3 className="mb-4 text-lg font-bold text-indigo-900">
        Admin: Add Employee
      </h3>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="idToken" value={token} />
        <input
          name="displayName"
          placeholder="Name"
          required
          className="w-full rounded border p-2 text-sm"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border p-2 text-sm"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded border p-2 text-sm"
        />
        <select name="role" className="w-full rounded border p-2 text-sm">
          <option value="dentist">Dentist</option>
          <option value="front-desk">Front Desk</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-indigo-700 py-2 text-sm font-bold text-white hover:bg-indigo-800"
        >
          {isPending ? "Creating..." : "Create Account"}
        </button>
        {state.success && <p className="text-green-600 text-xs">Success!</p>}
        {state.error && <p className="text-red-600 text-xs">{state.error}</p>}
      </form>
    </div>
  );
}

function PatientDetailsModal({
  patientId,
  onClose,
}: {
  patientId: string;
  onClose: () => void;
}) {
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatientRecord(patientId), getUserProfile(patientId)]).then(
      ([recordRes, profileRes]) => {
        if (recordRes.success) setRecord(recordRes.data || null);
        if (profileRes.success && profileRes.data)
          setDisplayName(profileRes.data.displayName || "");
        setLoading(false);
      }
    );
  }, [patientId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900">Patient Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !record ? (
          <p className="text-red-500">Record not found.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-bold">Name:</span> {displayName}
            </div>
            <div>
              <span className="font-bold">Phone:</span> {record.phoneNumber}
            </div>
            <div>
              <span className="font-bold">DOB:</span> {record.dateOfBirth}
            </div>
            <div>
              <span className="font-bold">Gender:</span> {record.gender}
            </div>
            <div>
              <span className="font-bold">Address:</span> {record.address}
            </div>
            <div>
              <span className="font-bold">Emergency:</span>{" "}
              {record.emergencyContact}
            </div>

            <div className="bg-red-50 p-3 rounded border border-red-100 mt-2">
              <p className="font-bold text-red-800 mb-1">Medical History</p>
              <p>
                <span className="font-semibold">Allergies:</span>{" "}
                {record.medicalHistory?.allergies?.join(", ") || "None"}
              </p>
              <p>
                <span className="font-semibold">Conditions:</span>{" "}
                {record.medicalHistory?.conditions?.join(", ") || "None"}
              </p>
              <p>
                <span className="font-semibold">Meds:</span>{" "}
                {record.medicalHistory?.medications || "None"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientEditForm({
  patientId,
  onClose,
}: {
  patientId: string;
  onClose?: () => void;
}) {
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(
    updatePatientRecordAction,
    { success: false }
  );

  // Fetch data on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([getPatientRecord(patientId), getUserProfile(patientId)]).then(
      ([recordRes, profileRes]) => {
        if (recordRes.success) setRecord(recordRes.data || null);
        if (profileRes.success && profileRes.data)
          setDisplayName(profileRes.data.displayName || "");
        setLoading(false);
      }
    );
  }, [patientId, state.success]);

  if (loading) return <div>Loading record...</div>;

  return (
    <div className="space-y-4">
      {record && (
        <div className="text-sm space-y-1 mb-4 p-3 bg-gray-50 rounded border">
          <p>
            <strong>Status:</strong>{" "}
            {record.isProfileComplete ? "✅ Complete" : "⚠️ Incomplete"}
          </p>
          <p className="text-xs text-gray-500">Editing ID: {patientId}</p>
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="targetUid" value={patientId} />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-green-800">
              Display Name
            </label>
            <input
              name="displayName"
              placeholder="Full Name"
              className="w-full p-2 border rounded text-sm"
              defaultValue={displayName}
              key={displayName}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-green-800">
              Phone
            </label>
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              className="w-full p-2 border rounded text-sm"
              defaultValue={record?.phoneNumber}
            />
          </div>
        </div>

        <div className="pt-2 border-t mt-2 space-y-2">
          <p className="text-xs font-bold text-red-800 italic">
            Clinical Details
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-600">
                Date of Birth
              </label>
              <input
                name="dateOfBirth"
                type="date"
                className="w-full p-2 border rounded text-sm"
                defaultValue={record?.dateOfBirth}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600">
                Gender
              </label>
              <select
                name="gender"
                className="w-full p-2 border rounded text-sm"
                defaultValue={record?.gender || "male"}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <input
            name="address"
            placeholder="Address"
            className="w-full p-2 border rounded text-sm"
            defaultValue={record?.address}
          />
          <input
            name="emergencyContact"
            placeholder="Emergency Contact"
            className="w-full p-2 border rounded text-sm"
            defaultValue={record?.emergencyContact}
          />

          <div className="bg-green-50 p-3 rounded border border-green-100 mt-2">
            <p className="text-xs font-bold text-green-800 mb-2">
              Medical History
            </p>
            <input
              name="allergies"
              placeholder="Allergies (comma separated)"
              className="w-full p-2 border rounded text-sm mb-2"
              defaultValue={record?.medicalHistory?.allergies?.join(", ")}
            />
            <input
              name="conditions"
              placeholder="Conditions (comma separated)"
              className="w-full p-2 border rounded text-sm mb-2"
              defaultValue={record?.medicalHistory?.conditions?.join(", ")}
            />
            <textarea
              name="medications"
              placeholder="Medications"
              className="w-full p-2 border rounded text-sm h-16"
              defaultValue={record?.medicalHistory?.medications}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
            >
              Cancel
            </button>
          )}
          <button
            disabled={isPending}
            className="px-6 py-2 bg-green-700 text-white rounded font-bold hover:bg-green-800 disabled:opacity-50 text-sm"
          >
            {isPending ? "Saving..." : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PatientEditModal({
  patientId,
  onClose,
}: {
  patientId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900">
            Edit Patient Record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <PatientEditForm patientId={patientId} onClose={onClose} />
      </div>
    </div>
  );
}

function ClinicScheduleSection() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [schedule, setSchedule] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  const refreshSchedule = () => {
    setLoading(true);
    getClinicScheduleAction(date).then((res) => {
      if (res.success)
        setSchedule((res.data as AppointmentWithPatient[]) || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointmentStatusAction(id, newStatus as AppointmentStatus);
    refreshSchedule();
  };

  return (
    <div className="space-y-4 rounded-lg border border-purple-100 bg-purple-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-purple-900">Clinic Schedule</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded p-1 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading schedule...</p>
      ) : schedule.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No appointments for this date.
        </p>
      ) : (
        <div className="space-y-2">
          {schedule.map((app) => (
            <div
              key={app.id}
              className="flex flex-col gap-2 p-3 bg-white rounded border border-purple-100 text-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-purple-800">{app.time}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="font-medium text-gray-900">
                    {app.patientName}
                  </span>
                  <span className="mx-2 text-gray-400">-</span>
                  <span className="text-gray-600">{app.serviceType}</span>
                </div>

                {app.isProfileComplete ? (
                  <button
                    onClick={() => setViewingPatientId(app.patientId)}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                  >
                    View Patient
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingPatientId(app.patientId)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-bold border border-red-200"
                  >
                    ⚠️ Complete Record
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  className={`text-xs font-bold px-2 py-1 rounded uppercase border ${
                    app.status === "confirmed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : app.status === "completed"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : app.status === "cancelled"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingPatientId && (
        <PatientDetailsModal
          patientId={viewingPatientId}
          onClose={() => setViewingPatientId(null)}
        />
      )}

      {editingPatientId && (
        <PatientEditModal
          patientId={editingPatientId}
          onClose={() => {
            setEditingPatientId(null);
            refreshSchedule(); // Refresh to update status if completed
          }}
        />
      )}
    </div>
  );
}

export default function BackendTestPage() {
  const { user, role, loading, logout } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <h2 className="text-2xl font-bold">Backend Test Lab</h2>
        <div className="flex gap-4">
          <Link
            href="/backend-test/auth/signin"
            className="px-6 py-2 bg-gray-200 rounded"
          >
            Sign In
          </Link>
          <Link
            href="/backend-test/auth/signup"
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const isStaff = role && role !== "client";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-bold">
            {user.email} ({role})
          </p>
        </div>
        <button
          onClick={logout}
          className="text-red-600 font-bold hover:underline text-sm"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BookingSection />
        <HistorySection />

        {/* Standalone Patient Form */}
        <PatientSection />

        {isStaff && <ClinicScheduleSection />}

        {role === "admin" && <CreateEmployeeForm />}
      </div>
    </div>
  );
}
