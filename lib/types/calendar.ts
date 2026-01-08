// Global Clinic Holidays (e.g., Christmas, New Year)
export interface ClinicOffDay {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

// Specific Dentist Time Off (e.g., Sick leave, Vacation)
export interface DentistOffDay {
  id: string;
  dentistId: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}
