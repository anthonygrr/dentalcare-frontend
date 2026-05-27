import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPatient, type PatientCreationRequest } from '@/actions/patients/create-patient';

export const useCreatePatient = (page: number, size: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientCreationRequest) => createPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", { page, size }] });
    },
  });
};
