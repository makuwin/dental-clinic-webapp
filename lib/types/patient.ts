import { Timestamp } from "firebase/firestore";

export type Gender = "male" | "female" | "other";

export interface MedicalHistory {
  allergies?: string[];
  currentMedications?: string;
  pastConditions?: string;
  notes?: string;
}

export interface PatientRecord {
  uid: string; // Matches UserProfile.uid
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: MedicalHistory;
  isProfileComplete: boolean;
  updatedAt: Timestamp;
}
