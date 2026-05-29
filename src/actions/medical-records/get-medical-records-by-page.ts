import { medicalRecordApi } from "@/api/medical-record.api";
import type { MedicalRecordsResponse } from "@/types/medical-records-response";

export const getMedicalRecordsByPage = async (
  page: number,
  size: number = 8,
  name?: string,
  diagnosis?: string,
): Promise<MedicalRecordsResponse> => {
  if (isNaN(page)) page = 0;
  if (isNaN(size)) size = 8;

  const params: Record<string, string | number> = { page, size };
  if (name) params.name = name;
  if (diagnosis) params.diagnosis = diagnosis;

  const { data } = await medicalRecordApi.get("", { params });

  return {
    records: data.content ?? [],
    total: data.totalElements ?? 0,
    pages: data.totalPages ?? 0,
  };
};
