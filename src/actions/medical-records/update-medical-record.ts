import { medicalRecordApi } from "@/api/medical-record.api";
import type { MedicalRecordResponseItem } from "@/types/medical-records-response";

export interface MedicalRecordUpdateRequest {
  diagnosis: string;
  treatment: string;
}

export const updateMedicalRecord = async (id: number, payload: MedicalRecordUpdateRequest): Promise<MedicalRecordResponseItem> => {
  const { data } = await medicalRecordApi.put<MedicalRecordResponseItem>(`/${id}`, payload);
  return data;
};
