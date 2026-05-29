export interface MedicalRecordResponseItem {
  id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  patientId: number;
  patientName: string;
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  procedure: string;
  appointmentStatus: string;
  doctorName: string;
}

export interface MedicalRecordsResponse {
  records: MedicalRecordResponseItem[];
  total: number;
  pages: number;
}
