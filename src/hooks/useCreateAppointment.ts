import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment, type AppointmentCreateRequest } from '@/actions/appointments/create-appointment';

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppointmentCreateRequest) => createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
