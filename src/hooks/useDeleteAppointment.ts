import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppointment } from '@/actions/appointments/delete-appointment';

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
