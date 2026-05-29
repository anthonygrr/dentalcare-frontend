import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMedicalRecord, type MedicalRecordUpdateRequest } from '@/actions/medical-records/update-medical-record';

export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MedicalRecordUpdateRequest }) =>
      updateMedicalRecord(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
};
