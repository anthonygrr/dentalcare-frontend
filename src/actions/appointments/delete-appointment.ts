import { appointmentApi } from "@/api/appointment.api";

export const deleteAppointment = async (id: number): Promise<void> => {
  await appointmentApi.delete(`/${id}`);
};
