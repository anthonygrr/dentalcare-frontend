import { getMedicalRecordsByPage } from '@/actions/medical-records/get-medical-records-by-page';
import { useQuery } from '@tanstack/react-query';

export const usePaginatedMedicalRecord = (
  page: number,
  size: number = 8,
  name?: string,
  diagnosis?: string,
) => {
  return useQuery({
    queryKey: ["medical-records", { page, size, name, diagnosis }],
    queryFn: () => getMedicalRecordsByPage(page, size, name, diagnosis),
    staleTime: 1000 * 60 * 5,
  });
};

export default usePaginatedMedicalRecord;
