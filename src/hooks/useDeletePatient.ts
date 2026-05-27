import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePatient } from '@/actions/delete-patient';

export const useDeletePatient = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Number) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", { page, size }] });
    },
  });
};
