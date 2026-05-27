import { getPatientsByPage } from '@/actions/get-patients-by-page';
import { useQuery } from '@tanstack/react-query';
import React from 'react'


export const usePaginatedPatient = (page: number, size: number) => {
  return useQuery({
    queryKey: ["patients", { page, size }],
    queryFn: () => getPatientsByPage(page, size),
    staleTime: 1000 * 60 * 5, // por 5 minutos
  });
}

export default usePaginatedPatient
