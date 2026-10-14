# DentalCare — Panel de Administración de Clínica Dental

SPA moderna y completa para la gestión de clínicas dentales, construida con React 19, TanStack Router, TanStack Query y Tailwind CSS. Se conecta a un backend Spring Boot protegido con Spring Security y autenticación JWT.
[dentalcare-backend](https://github.com/anthonygrr/dentalcare-backend)

Aplicacion Backend en: 
---

## Stack Tecnológico

| Categoría        | Tecnología                          | Versión     |
|------------------|-------------------------------------|-------------|
| **Framework**    | React                               | 19.2.0      |
| **Lenguaje**     | TypeScript                          | 5.8.3       |
| **Enrutamiento** | TanStack Router                     | 1.168.25    |
| **Datos**        | TanStack Query (React Query)        | 5.83.0      |
| **SSR/SSG**      | TanStack Start                      | 1.167.50    |
| **Estilos**      | Tailwind CSS                        | 4.2.1       |
| **Componentes**  | shadcn/ui (Radix primitives)        | —           |
| **Iconos**       | Lucide React                        | 0.575.0     |
| **HTTP Client**  | Axios                               | 1.16.1      |
| **Date Picker**  | React Day Picker                    | 9.14.0      |
| **Toast**        | Sonner                              | 2.0.7       |
| **Build Tool**   | Vite                                | 7.3.1       |
| **Auth**         | JWT (access + refresh tokens)       | —           |

---

## Características

### Autenticación
- **Inicio de sesión JWT** — username/email + password contra Spring Security
- **Sesiones persistentes** — tokens guardados en `localStorage`
- **Auto‑adhesión** — token Bearer inyectado en cada petición mediante interceptor de Axios
- **Redirección 401** — tokens expirados o inválidos redirigen automáticamente al login
- **Cierre de sesión** — limpia los tokens y regresa a la página de login

### Pacientes
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Búsqueda por nombre del lado del cliente (trae todos los pacientes una vez, filtra en memoria)
- Diálogo de vista con edad calculada desde la fecha de nacimiento
- Diálogo de edición con validación de unicidad de email y teléfono
- Ordenados por nombre ascendente

### Doctores
- CRUD completo
- Selección de especialidad desde un enum (`GENERAL_DENTIST`, `ORTHODONTIST`, `ENDODONTIST`, `ORAL_SURGEON`, `PERIODONTIST`, `PROSTHODONTIST`, `PEDIATRIC_DENTIST`, `COSMETIC_DENTIST`)
- Validación de unicidad de email y teléfono
- Búsqueda por nombre del lado del cliente
- Ordenados por nombre ascendente

### Citas
- CRUD completo
- Pestañas de estado: Todas, Programada, Confirmada, En Progreso, Iniciada, Completada, Cancelada
- Filtros: fecha, procedimiento, búsqueda por nombre del paciente
- Detección de conflictos de horario con el doctor (previene doble reserva)
- Campos de diagnóstico y tratamiento visibles solo cuando el estado es `COMPLETED`
- Formato de hora de 12 horas (AM/PM)
- Paginación y búsqueda del lado del cliente

### Historias Clínicas
- Leer, Actualizar, Eliminar (se crean automáticamente al completar una cita)
- Búsqueda por nombre del paciente o diagnóstico
- Diálogo de vista con todos los detalles (fecha de cita, hora, procedimiento, diagnóstico, tratamiento)
- Edición de campos de diagnóstico y tratamiento

### Calendario
- Vista mensual interactiva con selector de fecha
- Haz clic en una fecha para ver todas las citas de ese día
- Insignias de estado con código de colores
- Botón "Nueva Cita" que pre‑rellena la fecha seleccionada
- Filtrado exacto del lado del cliente

### Dashboard
- Tarjetas de estadísticas: total de pacientes, citas pendientes, agenda de hoy, próximas citas
- Lista de próximas citas (siguientes 6)
- Diálogo de creación de citas con autocompletado de paciente/doctor
- Saludo personalizado con el nombre del usuario logueado

### Configuración
- Ver información del perfil (nombre, email, roles)
- Cambiar contraseña con validación de confirmación
- Datos reales desde `GET /api/users/me`

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│  TanStack Start (SSR)                                           │
├─────────────────────────────────────────────────────────────────┤
│  TanStack Router (rutas basadas en archivos)                    │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────┐   │
│  │Dashboard│ │Pacientes │ │Doctores   │ │Calendario│ │Login │   │
│  │         │ │Citas     │ │Hist.Clín. │ │Ajustes   │ │      │   │
│  └────┬────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘ └──┬───┘   │
│       └───────────┴─────────────┴────────────┴──────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  TanStack Query (gestión de estado del servidor)                │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐       │
│  │useQuery  │  │useMutation│  │queryClient│  │staleTime │       │
│  └────┬─────┘  └────┬──────┘  └───────────┘  └──────────┘       │
│       └─────────────┴───────────────────────────────────────────│
├─────────────────────────────────────────────────────────────────┤
│  Capa Axios API                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐   │
│  │Pacientes │ │Doctores  │ │Citas     │ │Hist.Clín.│ │Auth  │   │
│  │ API      │ │ API      │ │ API      │ │ API      │ │API   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘   │
│       └────────────┴────────────┴────────────┴──────────┘       │
│  Interceptores: [ Bearer Token ] [ 401 → / login ]              │
├─────────────────────────────────────────────────────────────────┤
│  Backend Spring Boot (proyecto separado)                        │
│  /api/auth  /api/patients  /api/doctors  /api/appointments      │
│  /api/medical-records  /api/users                               │
└─────────────────────────────────────────────────────────────────┘
```

### Patrones Clave

- **Separación de responsabilidades**: llamadas API en `src/api/`, wrappers de acciones en `src/actions/`, hooks en `src/hooks/`, páginas en `src/routes/`.
- **Una instancia Axios por entidad** — cada una con su interceptor de autenticación mediante `setupAuthInterceptor()`.
- **Búsqueda del lado del cliente** — pacientes, doctores, historias clínicas y calendario obtienen todos los registros una sola vez (hasta 10,000) y filtran en memoria para respuesta instantánea.
- **Validación pesimista de unicidad** — email y teléfono se verifican contra la lista completa en memoria antes de crear o actualizar.
- **Componentes reutilizables** — `SearchableSelect<T>` (combo de autocompletado genérico), `DataPagination`, `CreateAppointmentDialog` compartidos entre páginas.
- **Claves de TanStack Query** siguen el patrón `["entidad", "scope"]` (ej. `["patients", "all"]`, `["patients", { page, size, sort }]`) para evitar colisiones de caché.

---

## Estructura del Proyecto

```
src/
├── api/                # Instancias Axios e interceptores
│   ├── interceptors.ts
│   ├── auth.api.ts
│   ├── dentalcare.api.ts       # pacientes
│   ├── doctor.api.ts
│   ├── appointment.api.ts
│   └── medical-record.api.ts
├── actions/            # Funciones de acción de API
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   └── medical-records/
├── hooks/              # Hooks de TanStack Query
│   ├── useCreate*.ts
│   ├── useUpdate*.ts
│   ├── useDelete*.ts
│   └── usePaginated*.ts
├── contexts/           # Contextos de React
│   └── auth.tsx
├── types/              # Interfaces y enums de TypeScript
├── routes/             # Componentes de página (rutas basadas en archivos)
│   ├── __root.tsx      # Layout principal + guardia de autenticación
│   ├── login.tsx
│   ├── index.tsx       # Dashboard
│   ├── patients.tsx
│   ├── doctors.tsx
│   ├── appointments.tsx
│   ├── calendar.tsx
│   ├── medical-records.tsx
│   └── settings.tsx
├── components/         # Componentes UI
│   ├── ui/             # Primitivas shadcn/ui
│   ├── AppSidebar.tsx
│   ├── DataPagination.tsx
│   └── AppointmentDialog.tsx
└── lib/                # Utilidades
    └── utils.ts
```

---

## Primeros Pasos

### Requisitos
- Node.js ≥ 18
- Un backend Spring Boot en ejecución con los endpoints requeridos

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080
```

### Instalar y Ejecutar

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo (puerto 5173 por defecto)
pnpm run dev

# Construir para producción
pnpm run build

# Vista previa de la build de producción
pnpm run preview
```

### Scripts Disponibles

| Comando           | Descripción                           |
|-------------------|---------------------------------------|
| `pnpm run dev`    | Iniciar servidor de desarrollo Vite   |
| `pnpm run build`  | Construir para producción             |
| `pnpm run preview`| Vista previa de la build de producción|
| `pnpm run lint`   | Ejecutar ESLint                       |
| `pnpm run format` | Formatear con Prettier                |

---

## Autenticación

La aplicación usa autenticación JWT con Spring Security.

1. Navega a `/login`
2. Ingresa tu username o email y contraseña
3. Al iniciar sesión correctamente, la app guarda los tokens JWT y redirige al dashboard
4. Todas las peticiones API incluyen el encabezado `Authorization: Bearer <accessToken>`
5. Cuando el token expira, el interceptor 401 limpia la sesión y redirige a `/login`

### Endpoints de la API (Backend)

| Método | Endpoint                     | Descripción             |
|--------|------------------------------|-------------------------|
| POST   | `/api/auth/login`            | Autenticar usuario      |
| GET    | `/api/users/me`              | Obtener usuario actual  |
| PUT    | `/api/users/me`              | Actualizar contraseña   |
| GET    | `/api/patients`              | Listar pacientes        |
| POST   | `/api/patients`              | Crear paciente          |
| PUT    | `/api/patients/{id}`         | Actualizar paciente     |
| DELETE | `/api/patients/{id}`         | Eliminar paciente       |
| GET    | `/api/doctors`               | Listar doctores         |
| POST   | `/api/doctors`               | Crear doctor            |
| PUT    | `/api/doctors/{id}`          | Actualizar doctor       |
| DELETE | `/api/doctors/{id}`          | Eliminar doctor         |
| GET    | `/api/appointments`          | Listar citas            |
| POST   | `/api/appointments`          | Crear cita              |
| PUT    | `/api/appointments/{id}`     | Actualizar cita         |
| DELETE | `/api/appointments/{id}`     | Eliminar cita           |
| GET    | `/api/medical-records`       | Listar historias clínicas|
| PUT    | `/api/medical-records/{id}`  | Actualizar historia clínica |
| DELETE | `/api/medical-records/{id}`  | Eliminar historia clínica |

---

## Licencia

Licencia MIT

Copyright (c) 2026 DentalCare

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga
una copia de este software y de los archivos de documentación asociados (el "Software"),
para utilizar el Software sin restricción, incluyendo sin limitación los derechos
de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar, y/o vender
copias del Software, y para permitir a las personas a las que se les proporcione el
Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las
copias o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O
IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN,
IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS
AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN,
DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O
CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE
O SU USO U OTRAS OPERACIONES EN EL SOFTWARE.
