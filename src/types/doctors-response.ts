import { Doctor } from "./doctor.interface";
import type { Patient } from "./patient.interface";

export interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  pages: number;
}
