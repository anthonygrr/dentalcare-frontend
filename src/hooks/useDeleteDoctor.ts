import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDoctor } from '@/actions/delete-doctor';

export const useDeleteDoctor = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Number) => deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
