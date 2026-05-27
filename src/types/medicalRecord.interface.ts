import { Appointment } from "./appointment.interface";
import { Patient } from "./patient.interface";

export interface MedicalRecord {
    id: number;
    diagnosis: string;
    treatment: string;
    date: Date;
    patient: Patient;
    appointment: Appointment;
};