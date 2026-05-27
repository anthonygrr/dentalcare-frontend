import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePatient, type PatientUpdateRequest } from '@/actions/patients/update-patient';

export const useUpdatePatient = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: Number; payload: PatientUpdateRequest }) =>
      updatePatient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", { page, size }] });
    },
  });
};
