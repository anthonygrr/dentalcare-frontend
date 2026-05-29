import { getDoctorsByPage } from '@/actions/get-doctors-by-page';
import { useQuery } from '@tanstack/react-query';

export const usePaginatedDoctor = (page: number, size: number, sort: string = "name,asc", name?: string) => {
  return useQuery({
    queryKey: ["doctors", { page, size, sort, name }],
    queryFn: () => getDoctorsByPage(page, size, sort, name),
    staleTime: 1000 * 60 * 5,
  });
};

export default usePaginatedDoctor;
