import { appointmentApi } from "@/api/appointment.api";
import type { AppointmentResponseItem } from "@/types/appointments-response";

export interface AppointmentCreateRequest {
  date: string;
  time: string;
  procedure: string;
  patientId: number;
  doctorId: number;
}

export const createAppointment = async (payload: AppointmentCreateRequest): Promise<AppointmentResponseItem> => {
  const { data } = await appointmentApi.post<AppointmentResponseItem>("", payload);
  return data;
};
