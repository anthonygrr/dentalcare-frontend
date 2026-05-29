import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDoctor, type DoctorCreationRequest } from '@/actions/create-doctor';

export const useCreateDoctor = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoctorCreationRequest) => createDoctor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
