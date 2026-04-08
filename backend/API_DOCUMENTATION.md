# API Documentation - Sistema de Gestión de Eventos

## Información General

- **Base URL:** `http://localhost:5000/api`
- **Formato de respuesta:** JSON
- **Autenticación:** Bearer Token (JWT)

### Headers de Autenticación

Para endpoints protegidos, incluir el header:
```
Authorization: Bearer <token>
```

---

## Índice

1. [Autenticación](#autenticación)
2. [Eventos](#eventos)
3. [Asistentes](#asistentes)
4. [Administración](#administración)

---

## Autenticación

### Registrar Usuario

| Campo | Valor |
|-------|-------|
| **Nombre** | Register |
| **Método** | `POST` |
| **URL** | `/auth/register` |
| **Autenticación** | No requerida |

**Descripción:** Registra un nuevo usuario en el sistema.

**Parámetros (Body JSON):**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `name` | string | Sí | 2-100 caracteres | Nombre del usuario |
| `email` | string | Sí | Formato email válido | Correo electrónico |
| `password` | string | Sí | Mínimo 6 caracteres | Contraseña |

**Ejemplo de solicitud:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Ejemplo de respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "ORGANIZADOR",
    "created_at": "2026-03-06T10:30:00"
  }
}
```

---

### Iniciar Sesión

| Campo | Valor |
|-------|-------|
| **Nombre** | Login |
| **Método** | `POST` |
| **URL** | `/auth/login` |
| **Autenticación** | No requerida |

**Descripción:** Autentica un usuario y devuelve un token JWT.

**Parámetros (Body JSON):**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | string | Sí | Correo electrónico del usuario |
| `password` | string | Sí | Contraseña del usuario |

**Ejemplo de solicitud:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "ORGANIZADOR",
      "created_at": "2026-03-06T10:30:00"
    }
  }
}
```

**Errores comunes:**
| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | "Email y password son obligatorios" | Faltan campos requeridos |
| 401 | "Credenciales invalidas" | Email o contraseña incorrectos |

---

### Obtener Usuario Actual

| Campo | Valor |
|-------|-------|
| **Nombre** | Me |
| **Método** | `GET` |
| **URL** | `/auth/me` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene la información del usuario autenticado.

**Ejemplo de solicitud:**
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "ORGANIZADOR",
    "created_at": "2026-03-06T10:30:00"
  }
}
```

---

## Eventos

### Listar Eventos del Usuario

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Events |
| **Método** | `GET` |
| **URL** | `/events` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene todos los eventos del usuario autenticado.

**Ejemplo de solicitud:**
```
GET /api/events
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Conferencia Tech 2026",
      "description": "Evento de tecnología",
      "date": "2026-04-15T09:00:00",
      "location": "Centro de Convenciones",
      "max_capacity": 500,
      "status": "ACTIVO",
      "organizer_id": 1,
      "created_at": "2026-03-06T10:30:00"
    }
  ]
}
```

---

### Listar Eventos Activos

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Active Events |
| **Método** | `GET` |
| **URL** | `/events/active` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene todos los eventos con estado "ACTIVO".

**Ejemplo de solicitud:**
```
GET /api/events/active
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Conferencia Tech 2026",
      "description": "Evento de tecnología",
      "date": "2026-04-15T09:00:00",
      "location": "Centro de Convenciones",
      "max_capacity": 500,
      "status": "ACTIVO",
      "organizer_id": 1,
      "created_at": "2026-03-06T10:30:00"
    }
  ]
}
```

---

### Listar Eventos por Estado

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Events by Status |
| **Método** | `GET` |
| **URL** | `/events/status/{status}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene eventos filtrados por estado.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Valores válidos | Descripción |
|-----------|------|-----------|-----------------|-------------|
| `status` | string | Sí | `ACTIVO`, `SOLD_OUT`, `FINALIZADO`, `CANCELADO` | Estado del evento |

**Ejemplo de solicitud:**
```
GET /api/events/status/ACTIVO
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Conferencia Tech 2026",
      "status": "ACTIVO",
      ...
    }
  ]
}
```

---

### Obtener Evento por ID

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Event by ID |
| **Método** | `GET` |
| **URL** | `/events/{event_id}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene los detalles de un evento específico.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Ejemplo de solicitud:**
```
GET /api/events/1
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Conferencia Tech 2026",
    "description": "Evento de tecnología",
    "date": "2026-04-15T09:00:00",
    "location": "Centro de Convenciones",
    "max_capacity": 500,
    "status": "ACTIVO",
    "organizer_id": 1,
    "created_at": "2026-03-06T10:30:00"
  }
}
```

---

### Crear Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Create Event |
| **Método** | `POST` |
| **URL** | `/events` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Crea un nuevo evento.

**Parámetros (Body JSON):**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `title` | string | Sí | 3-200 caracteres | Título del evento |
| `description` | string | No | - | Descripción del evento |
| `date` | datetime | Sí | Formato ISO 8601 | Fecha y hora del evento |
| `location` | string | Sí | 2-255 caracteres | Ubicación del evento |
| `max_capacity` | integer | Sí | Mínimo 1 | Capacidad máxima de asistentes |

**Ejemplo de solicitud:**
```json
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Conferencia Tech 2026",
  "description": "Evento anual de tecnología",
  "date": "2026-04-15T09:00:00",
  "location": "Centro de Convenciones",
  "max_capacity": 500
}
```

**Ejemplo de respuesta exitosa (201):**
```json
{
  "message": "Evento creado",
  "data": {
    "id": 1,
    "title": "Conferencia Tech 2026",
    "description": "Evento anual de tecnología",
    "date": "2026-04-15T09:00:00",
    "location": "Centro de Convenciones",
    "max_capacity": 500,
    "status": "ACTIVO",
    "organizer_id": 1,
    "created_at": "2026-03-06T10:30:00"
  }
}
```

---

### Actualizar Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Update Event |
| **Método** | `PUT` |
| **URL** | `/events/{event_id}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Actualiza los datos de un evento existente.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Parámetros (Body JSON):** Todos opcionales

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-------------|
| `title` | string | 3-200 caracteres | Título del evento |
| `description` | string | - | Descripción del evento |
| `date` | datetime | Formato ISO 8601 | Fecha y hora del evento |
| `location` | string | 2-255 caracteres | Ubicación del evento |
| `max_capacity` | integer | Mínimo 1 | Capacidad máxima |
| `status` | string | `ACTIVO`, `SOLD_OUT`, `FINALIZADO`, `CANCELADO` | Estado del evento |

**Ejemplo de solicitud:**
```json
PUT /api/events/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Conferencia Tech 2026 - Edición Especial",
  "max_capacity": 600
}
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Evento actualizado",
  "data": {
    "id": 1,
    "title": "Conferencia Tech 2026 - Edición Especial",
    "max_capacity": 600,
    ...
  }
}
```

---

### Cancelar Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Cancel Event |
| **Método** | `PATCH` |
| **URL** | `/events/{event_id}/cancel` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Cancela un evento (cambia su estado a CANCELADO).

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Ejemplo de solicitud:**
```
PATCH /api/events/1/cancel
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Evento cancelado",
  "data": {
    "id": 1,
    "title": "Conferencia Tech 2026",
    "status": "CANCELADO",
    ...
  }
}
```

---

### Cambiar Estado del Evento (Admin)

| Campo | Valor |
|-------|-------|
| **Nombre** | Change Event Status |
| **Método** | `PATCH` |
| **URL** | `/events/{event_id}/status` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Cambia el estado de un evento. Solo administradores.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Parámetros (Body JSON):**

| Campo | Tipo | Requerido | Valores válidos | Descripción |
|-------|------|-----------|-----------------|-------------|
| `status` | string | Sí | `ACTIVO`, `SOLD_OUT`, `FINALIZADO`, `CANCELADO` | Nuevo estado |

**Ejemplo de solicitud:**
```json
PATCH /api/events/1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "FINALIZADO"
}
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Estado actualizado",
  "data": {
    "id": 1,
    "status": "FINALIZADO",
    ...
  }
}
```

---

### Eliminar Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Delete Event |
| **Método** | `DELETE` |
| **URL** | `/events/{event_id}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Elimina un evento.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Ejemplo de solicitud:**
```
DELETE /api/events/1
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Evento eliminado"
}
```

---

## Asistentes

### Listar Todos los Asistentes

| Campo | Valor |
|-------|-------|
| **Nombre** | Get All Attendees |
| **Método** | `GET` |
| **URL** | `/attendees` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene todos los asistentes del usuario autenticado.

**Ejemplo de solicitud:**
```
GET /api/attendees
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "María García",
      "email": "maria@ejemplo.com",
      "phone": "+1234567890",
      "created_at": "2026-03-06T10:30:00"
    }
  ]
}
```

---

### Obtener Asistente por ID

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Attendee by ID |
| **Método** | `GET` |
| **URL** | `/attendees/{attendee_id}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene los detalles de un asistente específico.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `attendee_id` | integer | Sí | ID del asistente |

**Ejemplo de solicitud:**
```
GET /api/attendees/1
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "name": "María García",
    "email": "maria@ejemplo.com",
    "phone": "+1234567890",
    "created_at": "2026-03-06T10:30:00"
  }
}
```

---

### Obtener Inscripciones de un Asistente

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Attendee Registrations |
| **Método** | `GET` |
| **URL** | `/attendees/{attendee_id}/registrations` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene todas las inscripciones de un asistente.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `attendee_id` | integer | Sí | ID del asistente |

**Ejemplo de solicitud:**
```
GET /api/attendees/1/registrations
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "attendee_id": 1,
      "registration_date": "2026-03-06T10:30:00",
      "status": "CONFIRMADO"
    }
  ]
}
```

---

### Registrar Asistente a Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Register Attendee to Event |
| **Método** | `POST` |
| **URL** | `/attendees/event/{event_id}/register` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Registra un nuevo asistente a un evento específico.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Parámetros (Body JSON):**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `name` | string | Sí | 2-100 caracteres | Nombre del asistente |
| `email` | string | Sí | Formato email válido | Correo electrónico |
| `phone` | string | No | Máximo 20 caracteres | Teléfono de contacto |

**Ejemplo de solicitud:**
```json
POST /api/attendees/event/1/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "phone": "+1234567890"
}
```

**Ejemplo de respuesta exitosa (201):**
```json
{
  "message": "Inscripción creada",
  "data": {
    "id": 1,
    "event_id": 1,
    "attendee_id": 1,
    "registration_date": "2026-03-06T10:30:00",
    "status": "CONFIRMADO"
  }
}
```

---

### Obtener Asistentes de un Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Event Attendees |
| **Método** | `GET` |
| **URL** | `/attendees/event/{event_id}` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Obtiene todas las inscripciones/asistentes de un evento.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Ejemplo de solicitud:**
```
GET /api/attendees/event/1
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "attendee_id": 1,
      "registration_date": "2026-03-06T10:30:00",
      "status": "CONFIRMADO"
    }
  ]
}
```

---

### Cancelar Inscripción

| Campo | Valor |
|-------|-------|
| **Nombre** | Cancel Registration |
| **Método** | `PATCH` |
| **URL** | `/attendees/registration/{registration_id}/cancel` |
| **Autenticación** | Requerida (Token) |

**Descripción:** Cancela una inscripción existente.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `registration_id` | integer | Sí | ID de la inscripción |

**Ejemplo de solicitud:**
```
PATCH /api/attendees/registration/1/cancel
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "message": "Inscripción cancelada",
  "data": {
    "id": 1,
    "event_id": 1,
    "attendee_id": 1,
    "registration_date": "2026-03-06T10:30:00",
    "status": "CANCELADO"
  }
}
```

---

## Administración

> **Nota:** Todos los endpoints de administración requieren rol de ADMIN.

### Obtener Estadísticas

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Stats |
| **Método** | `GET` |
| **URL** | `/admin/stats` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene estadísticas generales del sistema.

**Ejemplo de solicitud:**
```
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": {
    "events": 15,
    "users": 50,
    "registrations": 230
  }
}
```

---

### Listar Todos los Eventos (Admin)

| Campo | Valor |
|-------|-------|
| **Nombre** | Get All Events (Admin) |
| **Método** | `GET` |
| **URL** | `/admin/events` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todos los eventos del sistema.

**Ejemplo de solicitud:**
```
GET /api/admin/events
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Conferencia Tech 2026",
      "status": "ACTIVO",
      ...
    }
  ]
}
```

---

### Listar Todos los Usuarios

| Campo | Valor |
|-------|-------|
| **Nombre** | Get All Users |
| **Método** | `GET` |
| **URL** | `/admin/users` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todos los usuarios del sistema.

**Ejemplo de solicitud:**
```
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "ORGANIZADOR",
      "created_at": "2026-03-06T10:30:00"
    }
  ]
}
```

---

### Listar Usuarios por Rol

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Users by Role |
| **Método** | `GET` |
| **URL** | `/admin/users/role/{role}` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene usuarios filtrados por rol.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Valores válidos | Descripción |
|-----------|------|-----------|-----------------|-------------|
| `role` | string | Sí | `ADMIN`, `ORGANIZADOR` | Rol del usuario |

**Ejemplo de solicitud:**
```
GET /api/admin/users/role/ORGANIZADOR
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Ana López",
      "email": "ana@ejemplo.com",
      "role": "ORGANIZADOR",
      "created_at": "2026-03-06T10:30:00"
    }
  ]
}
```

---

### Listar Todas las Inscripciones

| Campo | Valor |
|-------|-------|
| **Nombre** | Get All Registrations |
| **Método** | `GET` |
| **URL** | `/admin/registrations` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todas las inscripciones del sistema.

**Ejemplo de solicitud:**
```
GET /api/admin/registrations
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "attendee_id": 1,
      "registration_date": "2026-03-06T10:30:00",
      "status": "CONFIRMADO"
    }
  ]
}
```

---

### Listar Eventos por Estado (Admin)

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Events by Status (Admin) |
| **Método** | `GET` |
| **URL** | `/admin/events/status/{status}` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene eventos filtrados por estado (vista admin).

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Valores válidos | Descripción |
|-----------|------|-----------|-----------------|-------------|
| `status` | string | Sí | `ACTIVO`, `SOLD_OUT`, `FINALIZADO`, `CANCELADO` | Estado del evento |

**Ejemplo de solicitud:**
```
GET /api/admin/events/status/ACTIVO
Authorization: Bearer <admin_token>
```

---

### Listar Eventos Activos (Admin)

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Active Events (Admin) |
| **Método** | `GET` |
| **URL** | `/admin/events/active` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todos los eventos activos (vista admin).

**Ejemplo de solicitud:**
```
GET /api/admin/events/active
Authorization: Bearer <admin_token>
```

---

### Obtener Inscripciones por Evento

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Registrations by Event |
| **Método** | `GET` |
| **URL** | `/admin/registrations/event/{event_id}` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todas las inscripciones de un evento específico.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `event_id` | integer | Sí | ID del evento |

**Ejemplo de solicitud:**
```
GET /api/admin/registrations/event/1
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "attendee_id": 1,
      "registration_date": "2026-03-06T10:30:00",
      "status": "CONFIRMADO"
    }
  ]
}
```

---

### Obtener Inscripciones por Asistente

| Campo | Valor |
|-------|-------|
| **Nombre** | Get Registrations by Attendee |
| **Método** | `GET` |
| **URL** | `/admin/registrations/attendee/{attendee_id}` |
| **Autenticación** | Requerida (Admin) |

**Descripción:** Obtiene todas las inscripciones de un asistente específico.

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `attendee_id` | integer | Sí | ID del asistente |

**Ejemplo de solicitud:**
```
GET /api/admin/registrations/attendee/1
Authorization: Bearer <admin_token>
```

**Ejemplo de respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "attendee_id": 1,
      "registration_date": "2026-03-06T10:30:00",
      "status": "CONFIRMADO"
    }
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - Sin permisos para esta acción |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Modelos de Datos

### Usuario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único del usuario |
| `name` | string | Nombre del usuario |
| `email` | string | Correo electrónico |
| `role` | string | Rol: `ADMIN` o `ORGANIZADOR` |
| `created_at` | datetime | Fecha de creación |

### Evento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único del evento |
| `title` | string | Título del evento |
| `description` | string | Descripción |
| `date` | datetime | Fecha y hora del evento |
| `location` | string | Ubicación |
| `max_capacity` | integer | Capacidad máxima |
| `status` | string | Estado: `ACTIVO`, `SOLD_OUT`, `FINALIZADO`, `CANCELADO` |
| `organizer_id` | integer | ID del organizador |
| `created_at` | datetime | Fecha de creación |

### Asistente

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único del asistente |
| `name` | string | Nombre del asistente |
| `email` | string | Correo electrónico |
| `phone` | string | Teléfono (opcional) |
| `created_at` | datetime | Fecha de creación |

### Inscripción (Registration)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único de la inscripción |
| `event_id` | integer | ID del evento |
| `attendee_id` | integer | ID del asistente |
| `registration_date` | datetime | Fecha de inscripción |
| `status` | string | Estado de la inscripción |
