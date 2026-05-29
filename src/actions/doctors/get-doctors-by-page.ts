import { dentalApi } from "@/api/dentalcare.api";
import { DoctorsResponse } from "@/types/doctors-response";

export const getDoctorsByPage = async (
  page: number,
  size: number = 6,
  sort: string = "name,asc"
): Promise<DoctorsResponse> => {
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
    doctors: data.content ?? [],
    total: data.totalElements ?? 0,
    pages: data.totalPages ?? 0,
  };
};