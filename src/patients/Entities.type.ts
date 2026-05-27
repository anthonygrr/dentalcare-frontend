

export interface Patient {
  id: Number;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  appointments: Appointment[];
};

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

export enum AppointmentStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  STARTED = "STARTED",
  IN_PROGRESS = "IN_PROGRESS"
};

export interface Doctor {
  id: Number;
  name: String;
  email: String;
  phone: String;
  address: String;
  specialty: Specialty;
};

export interface MedicalRecord {
    id: number;
    diagnosis: string;
    treatment: string;
    date: Date;
    patient: Patient;
    appointment: Appointment;
};

export enum Specialty {
  DENTIST = "PENDING",
  GENERAL = "CONFIRMED",
  TAUTOLOGOUS = "CANCELLED",
  FAMILY_MEDICINE= "FAMILY_MEDICINE",
  INTERNAL_MEDICINE= "INTERNAL_MEDICINE",
  PEDIATRIC = "PEDIATRIC",
  OBSTETRICS_GYNECOLOGY = "OBSTETRICS_GYNECOLOGY" ,
  DIAGNOSIS = "DIAGNOSIS"
}
