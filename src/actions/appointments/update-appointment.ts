import { appointmentApi } from "@/api/appointment.api";
import type { AppointmentResponseItem } from "@/types/appointments-response";
import type { AppointmentStatus } from "@/types/appointmentStatus.enum";

export interface AppointmentUpdateRequest {
  date: string;
  time: string;
  procedure: string;
  status: AppointmentStatus;
  diagnosis?: string;
  treatment?: string;
}

export const updateAppointment = async (id: number, payload: AppointmentUpdateRequest): Promise<AppointmentResponseItem> => {
  const { data } = await appointmentApi.put<AppointmentResponseItem>(`/${id}`, payload);
  return data;
};
