import { dentalApi } from "@/api/dentalcare.api";
import type { Patient } from "@/types/patient.interface";

export interface PatientCreationRequest {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export const createPatient = async (payload: PatientCreationRequest): Promise<Patient> => {
  const { data } = await dentalApi.post<Patient>("", payload);
  return data;
};
