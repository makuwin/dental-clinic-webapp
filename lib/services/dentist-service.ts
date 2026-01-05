import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { DentistProfile } from "../types/dentist";
import { dentistProfileSchema } from "../validations/auth";
import { z } from "zod";

const COLLECTION_NAME = "dentist_profiles";

export async function getDentistProfile(uid: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { success: true, data: snap.data() as DentistProfile };
    }
    return { success: false, error: "Profile not found" };
  } catch (error) {
    console.error("Error fetching dentist profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

export async function updateDentistProfile(uid: string, data: z.infer<typeof dentistProfileSchema>) {
  try {
    const validData = dentistProfileSchema.parse(data);

    const docRef = doc(db, COLLECTION_NAME, uid);
    await setDoc(docRef, {
      ...validData,
      uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error updating dentist profile:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}
