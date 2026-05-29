import { medicalRecordApi } from "@/api/medical-record.api";

export const deleteMedicalRecord = async (id: number): Promise<void> => {
  await medicalRecordApi.delete(`/${id}`);
};
