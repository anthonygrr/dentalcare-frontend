export type AppointmentStatus =
  | "Completed"
  | "Scheduled"
  | "Started"
  | "Confirmed"
  | "In Progress"
  | "Cancelled";

export type Appointment = {
  id: string;
  patient: string;
  date: string;
  time: string;
  procedure: string;
  status: AppointmentStatus;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  address: string;
  phone: string;
  email: string;
};

export type MedicalRecord = {
  id: string;
  patient: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
};

const procedures = [
  "Cleaning",
  "Root Canal",
  "Filling",
  "Whitening",
  "Extraction",
  "Crown",
  "Checkup",
  "Braces Adjustment",
];

const statuses: AppointmentStatus[] = [
  "Completed",
  "Scheduled",
  "Started",
  "Confirmed",
  "In Progress",
  "Cancelled",
];

const firstNames = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Elijah",
  "Harper",
  "Oliver",
  "Evelyn",
  "Henry",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
];

const streets = [
  "Maple St",
  "Oak Ave",
  "Pine Rd",
  "Cedar Ln",
  "Elm Dr",
  "Birch Blvd",
];

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const r = rng(42);

export const patients: Patient[] = Array.from({ length: 47 }, (_, i) => {
  const fn = firstNames[Math.floor(r() * firstNames.length)];
  const ln = lastNames[Math.floor(r() * lastNames.length)];
  return {
    id: `P-${1000 + i}`,
    name: `${fn} ${ln}`,
    age: 18 + Math.floor(r() * 60),
    address: `${100 + Math.floor(r() * 900)} ${streets[Math.floor(r() * streets.length)]}, Springfield`,
    phone: `(555) ${100 + Math.floor(r() * 899)}-${1000 + Math.floor(r() * 8999)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
  };
});

export const appointments: Appointment[] = Array.from({ length: 63 }, (_, i) => {
  const p = patients[Math.floor(r() * patients.length)];
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(r() * 30) - 10);
  return {
    id: `A-${2000 + i}`,
    patient: p.name,
    date: d.toISOString().slice(0, 10),
    time: `${8 + Math.floor(r() * 9)}:${r() > 0.5 ? "30" : "00"}`,
    procedure: procedures[Math.floor(r() * procedures.length)],
    status: statuses[Math.floor(r() * statuses.length)],
  };
});

export const medicalRecords: MedicalRecord[] = Array.from(
  { length: 38 },
  (_, i) => {
    const p = patients[Math.floor(r() * patients.length)];
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(r() * 365));
    return {
      id: `M-${3000 + i}`,
      patient: p.name,
      date: d.toISOString().slice(0, 10),
      diagnosis: ["Cavity", "Gingivitis", "Tooth decay", "Healthy", "Plaque"][
        Math.floor(r() * 5)
      ],
      treatment: procedures[Math.floor(r() * procedures.length)],
      notes: "Routine follow-up recommended in 6 months.",
    };
  },
);

export const statusColor: Record<AppointmentStatus, string> = {
  Completed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Scheduled: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Started: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Confirmed: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
  "In Progress": "bg-violet-500/15 text-violet-700 border-violet-500/30",
  Cancelled: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};
