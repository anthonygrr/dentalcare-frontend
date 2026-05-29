import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDoctor, type DoctorUpdateRequest } from '@/actions/update-doctor';

export const useUpdateDoctor = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: Number; payload: DoctorUpdateRequest }) =>
      updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
