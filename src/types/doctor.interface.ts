import { Specialty } from "./specialty.enum";

export interface Doctor {
  id: Number;
  name: String;
  email: String;
  phone: String;
  address: String;
  specialty: Specialty;
};