import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { PatientRecord } from "../types/patient";
import { patientRecordSchema } from "../validations/auth";
import { z } from "zod";

const COLLECTION_NAME = "patient_records";

export async function getPatientRecord(uid: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { success: true, data: snap.data() as PatientRecord };
    }
    return { success: false, error: "Record not found" };
  } catch (error) {
    console.error("Error fetching patient record:", error);
    return { success: false, error: "Failed to fetch record" };
  }
}

export async function updatePatientRecord(uid: string, data: z.infer<typeof patientRecordSchema>) {
  try {
    // 1. Validate data structure (double check)
    const validData = patientRecordSchema.parse(data);

    // 2. Check completeness
    const isProfileComplete = !!(
      validData.dateOfBirth &&
      validData.address &&
      validData.emergencyContact &&
      validData.gender
    );

    // 3. Save to Firestore
    const docRef = doc(db, COLLECTION_NAME, uid);
    await setDoc(docRef, {
      ...validData,
      uid,
      isProfileComplete,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error updating patient record:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update record" };
  }
}
