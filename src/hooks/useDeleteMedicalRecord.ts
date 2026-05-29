import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMedicalRecord } from '@/actions/medical-records/delete-medical-record';

export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMedicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
};
