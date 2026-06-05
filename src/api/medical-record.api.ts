import axios from "axios";
import { setupAuthInterceptor } from "./interceptors";

const BASE_URL = import.meta.env.VITE_API_URL;

export const medicalRecordApi = axios.create({
  baseURL: `${BASE_URL}/medical-records`,
});

setupAuthInterceptor(medicalRecordApi);
