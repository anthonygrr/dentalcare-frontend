import { doctorApi } from "@/api/doctor.api";
import type { DoctorsResponse } from "@/types/doctors-response";

export const getDoctorsByPage = async (
  page: number,
  size: number = 6,
  sort: string = "name,asc",
  name?: string,
): Promise<DoctorsResponse> => {
  if (isNaN(page)) page = 1;
  if (isNaN(size)) size = 6;

  const params: Record<string, string | number> = { page, size, sort };
  if (name) params.name = name;

  const { data } = await doctorApi.get("", { params });

  return {
    doctors: data.content ?? [],
    total: data.totalElements ?? 0,
    pages: data.totalPages ?? 0,
  };
};