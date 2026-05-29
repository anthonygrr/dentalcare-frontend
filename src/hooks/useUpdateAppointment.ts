import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointment, type AppointmentUpdateRequest } from '@/actions/appointments/update-appointment';

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AppointmentUpdateRequest }) =>
      updateAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
