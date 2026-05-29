import { getDoctorsByPage } from '@/actions/doctors/get-doctors-by-page';
import { useQuery } from '@tanstack/react-query'

export const usePaginatedDoctor = (page: number, size: number, sort: string = "name,asc") => {
  return useQuery({
    queryKey: ["doctors", { page, size, sort }],
    queryFn: () => getDoctorsByPage(page, size, sort),
    staleTime: 1000 * 60 * 5,
  });
};

 export default usePaginatedDoctor
