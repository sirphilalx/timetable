import { platformStorage } from "./storage";

export const CURRENT_STUDENT_ID_KEY = "current_student_id";

// Calculate age in completed years from ISO date string (YYYY-MM-DD)
export function calculateAge(dateOfBirthIso: string, referenceDate: Date = new Date()): number {
  const parts = dateOfBirthIso.split("-").map(Number);
  const birthYear = parts[0] ?? referenceDate.getFullYear();
  const birthMonth = (parts[1] ?? 1) - 1; // JS month 0-11
  const birthDay = parts[2] ?? 1;

  let age = referenceDate.getFullYear() - birthYear;
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
}

// Check if student is a minor under Nigerian Data Protection Act 2023 (under 18 years old)
export function isMinorStudent(dateOfBirthIso: string, referenceDate: Date = new Date()): boolean {
  return calculateAge(dateOfBirthIso, referenceDate) < 18;
}

// Generate cryptographically random 32 character hex string for guardian web approval tokens
export function generateConsentToken(): string {
  const chars = "0123456789abcdef";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[(Math.random() * 16) | 0];
  }
  return token;
}

// Determine if an account can persist personal student rows to cloud database
export function canPersistPersonalDataToCloud(isMinor: number, consentStatus: string): boolean {
  if (isMinor === 0) {
    return true;
  }
  return consentStatus === "approved";
}

// Get the active student UUID on this physical device
export async function getActiveStudentId(): Promise<string | null> {
  return await platformStorage.getItem(CURRENT_STUDENT_ID_KEY);
}

// Store the active student UUID on this physical device
export async function setActiveStudentId(studentId: string): Promise<void> {
  await platformStorage.setItem(CURRENT_STUDENT_ID_KEY, studentId);
}

// Clear the active student UUID on logout
export async function clearActiveStudentId(): Promise<void> {
  await platformStorage.removeItem(CURRENT_STUDENT_ID_KEY);
}
