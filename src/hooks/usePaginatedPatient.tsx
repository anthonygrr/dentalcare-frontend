import { getPatientsByPage } from '@/actions/get-patients-by-page';
import { useQuery } from '@tanstack/react-query';
import React from 'react'


export const usePaginatedPatient = (page: number, size: number, sort: string = "name,asc") => {
  return useQuery({
    queryKey: ["patients", { page, size, sort }],
    queryFn: () => getPatientsByPage(page, size, sort),
    staleTime: 1000 * 60 * 5,
  });
}

export default usePaginatedPatient
