import axios from "axios";
import { setupAuthInterceptor } from "./interceptors";

const BASE_URL = import.meta.env.VITE_API_URL;

export const doctorApi = axios.create({
  baseURL: `${BASE_URL}/doctors`,
});

setupAuthInterceptor(doctorApi);
