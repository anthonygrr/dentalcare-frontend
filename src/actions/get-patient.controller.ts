import { dentalApi } from "@/api/dentalcare.api";
import type { Patient } from "@/types/patient.interface"

const BASE_URL = import.meta.env.VITE_API_URL;

export const getPatientsAction = async (idSlug: string) => {
  const { data } = await dentalApi.get<Patient>(`/${idSlug}`);

  return {
    ...data,
  };
};
