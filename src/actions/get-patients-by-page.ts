import { dentalApi } from "@/api/dentalcare.api";
import type { PatientsResponse } from "@/types/patients-response";

export const getPatientsByPage = async (
  page: number,
  size: number = 6,
  sort: string = "name,asc"
): Promise<PatientsResponse> => {
  if (isNaN(page)) {
    page = 1;
  }
  if (isNaN(size)) {
    size = 6;
  }

  const { data } = await dentalApi.get("", {
    params: { page, size, sort },
  });

  return {
    patients: data.content ?? [],
    total: data.totalElements ?? 0,
    pages: data.totalPages ?? 0,
  };
};
