import { dentalApi } from "@/api/dentalcare.api";

export const deletePatient = async (id: Number): Promise<void> => {
  await dentalApi.delete(`/${id}`);
};
