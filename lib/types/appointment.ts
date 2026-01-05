import { Timestamp } from "firebase/firestore";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  id: string; // Firestore Document ID
  patientId: string; // User UID
  dentistId?: string; // Optional (assigned later or selected)
  serviceType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: Timestamp;
}
