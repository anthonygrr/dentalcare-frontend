import { doctorApi } from "@/api/doctor.api";
import type { Doctor } from "@/types/doctor.interface";

export interface DoctorUpdateRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialty: string;
}

export const updateDoctor = async (id: Number, payload: DoctorUpdateRequest): Promise<Doctor> => {
  const { data } = await doctorApi.put<Doctor>(`/${id}`, payload);
  return data;
};
