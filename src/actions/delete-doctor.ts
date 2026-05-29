import { doctorApi } from "@/api/doctor.api";

export const deleteDoctor = async (id: Number): Promise<void> => {
  await doctorApi.delete(`/${id}`);
};
