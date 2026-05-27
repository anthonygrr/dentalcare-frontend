import { Appointment } from "./appointment.interface";

export interface Patient {
  id: Number;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;

  appointments: Appointment[];
};