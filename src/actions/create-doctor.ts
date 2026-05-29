import { doctorApi } from "@/api/doctor.api";
import type { Doctor } from "@/types/doctor.interface";

export interface DoctorCreationRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialty: string;
}

export const createDoctor = async (payload: DoctorCreationRequest): Promise<Doctor> => {
  const { data } = await doctorApi.post<Doctor>("", payload);
  return data;
};
