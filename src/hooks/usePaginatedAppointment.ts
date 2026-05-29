import { getAppointmentsByPage } from '@/actions/appointments/get-appointments-by-page';
import { useQuery } from '@tanstack/react-query';
import type { AppointmentStatus } from '@/types/appointmentStatus.enum';

export const usePaginatedAppointment = (
  page: number,
  size: number = 8,
  status?: AppointmentStatus,
  date?: string,
  procedure?: string,
  name?: string,
) => {
  return useQuery({
    queryKey: ["appointments", { page, size, status, date, procedure, name }],
    queryFn: () => getAppointmentsByPage(page, size, status, date, procedure, name),
    staleTime: 1000 * 60 * 5,
  });
};

export default usePaginatedAppointment;
