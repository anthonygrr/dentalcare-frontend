import type { Patient } from "./patient.interface";

export interface PatientsResponse {
  patients: Patient[];
  total: number;
  pages: number;
}
