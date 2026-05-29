import { appointmentApi } from "@/api/appointment.api";
import type { AppointmentsResponse } from "@/types/appointments-response";
import type { AppointmentStatus } from "@/types/appointmentStatus.enum";

export const getAppointmentsByPage = async (
  page: number,
  size: number = 8,
  status?: AppointmentStatus,
  date?: string,
  procedure?: string,
  name?: string,
): Promise<AppointmentsResponse> => {
  if (isNaN(page)) page = 0;
  if (isNaN(size)) size = 8;

  const params: Record<string, string | number> = { page, size };
  if (status) params.status = status;
  if (date) params.date = date;
  if (procedure) params.procedure = procedure;
  if (name) params.name = name;

  const { data } = await appointmentApi.get("", { params });

  return {
    appointments: data.content ?? [],
    total: data.totalElements ?? 0,
    pages: data.totalPages ?? 0,
  };
};
