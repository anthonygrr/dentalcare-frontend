import { dentalApi } from "@/api/dentalcare.api";
import type { Patient } from "@/types/patient.interface";

export interface PatientUpdateRequest {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export const updatePatient = async (id: Number, payload: PatientUpdateRequest): Promise<Patient> => {
  const { data } = await dentalApi.put<Patient>(`/${id}`, payload);
  return data;
};
