import type { AppointmentStatus } from "./appointmentStatus.enum";

export interface AppointmentResponseItem {
  id: number;
  date: string;
  time: string;
  procedure: string;
  status: AppointmentStatus;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
}

export interface AppointmentsResponse {
  appointments: AppointmentResponseItem[];
  total: number;
  pages: number;
}
