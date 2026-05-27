import { AppointmentStatus } from "./appointmentStatus.enum";
import { Doctor } from "./doctor.interface";
import { MedicalRecord } from "./medicalRecord.interface";
import { Patient } from "./patient.interface";

export interface Appointment {
  id: Number;
  date: Date;
  time: string;
  procedure: string;
  status: AppointmentStatus;
  patient: Patient;
  doctor: Doctor;
  medicalRecord: MedicalRecord;
};