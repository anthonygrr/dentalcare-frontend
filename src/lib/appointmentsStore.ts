import { useSyncExternalStore } from "react";
import {
  appointments as seed,
  type Appointment,
  type AppointmentStatus,
} from "./mockData";

let state: Appointment[] = [...seed];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const appointmentsStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add: (a: Omit<Appointment, "id">) => {
    const id = `A-${Math.floor(Math.random() * 90000) + 10000}`;
    state = [{ id, ...a }, ...state];
    emit();
  },
  update: (a: Appointment) => {
    state = state.map((x) => (x.id === a.id ? a : x));
    emit();
  },
  setStatus: (id: string, status: AppointmentStatus) => {
    state = state.map((x) => (x.id === id ? { ...x, status } : x));
    emit();
  },
  remove: (id: string) => {
    state = state.filter((x) => x.id !== id);
    emit();
  },
};

export function useAppointments() {
  return useSyncExternalStore(
    appointmentsStore.subscribe,
    appointmentsStore.get,
    appointmentsStore.get,
  );
}

export const ALL_STATUSES: AppointmentStatus[] = [
  "Completed",
  "Scheduled",
  "Started",
  "Confirmed",
  "In Progress",
  "Cancelled",
];
