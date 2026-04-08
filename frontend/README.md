# Sistema de Gestion de Eventos - Frontend

Aplicacion frontend desarrollada con Next.js, React y TypeScript para el Sistema de Gestion de Eventos.

Roles soportados:

- ADMIN: vista global del sistema, dashboard y gestion de eventos/personas.
- ORGANIZADOR: panel para crear, editar, cancelar y consultar sus propios eventos.

---

## 1. Quick Start 

Desde la raiz del repositorio ejecuta:

```powershell
# 1) Backend
cd backend
pip install -r requirements.txt

# 2) Migraciones (si aplica en tu entorno)
flask --app run.py db upgrade

# 3) Seed de usuarios/eventos de desarrollo
python seed_admin.py
python seed_events.py

# 4) Levantar backend
python run.py

# 5) En otra terminal, levantar frontend
cd ..\frontend
npm install
npm run dev
```

Abrir en navegador:

- Frontend: `http://localhost:3000`
- API esperada por defecto en el frontend: `http://127.0.0.1:5000/api`

> o segun tu entorno, `5001`

---

## 2. Requisitos previos

- Node.js 18 o superior
- npm
- Python 3.12 o superior
- PostgreSQL corriendo localmente
- Base de datos accesible para el backend

Configuracion por defecto de base de datos en backend:

`postgresql+psycopg://postgres:root@localhost:5432/eventos_db`

---

## 3. Configuracion de entorno (frontend)

El cliente HTTP central usa esta variable:

```ts
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000/api";
```

Si necesitas override local (por ejemplo backend en 5001), crea `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5001/api
```

Si usas el flujo estandar del equipo, puedes dejar:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
```

> Cada cambio en `.env.local` requiere reiniciar `npm run dev`.

---

## 4. Instalacion y ejecucion

### 4.1 Backend (minimo para que frontend funcione)

1. Instalar dependencias de Python en `backend/`.
2. Aplicar migraciones.
3. Ejecutar seeders:
   - `python seed_admin.py`
   - `python seed_events.py`
4. Levantar backend con `python run.py`.

### 4.2 Frontend

En `frontend/`:

```powershell
npm install
npm run dev
```

La app queda en `http://localhost:3000`.

---

## 5. Credenciales de prueba (desarrollo)

### 5.1 Admin

- Email: `admin@admin.com`
- Password: `Admin123456`

### 5.2 Organizadores

- `christian.renderos@empresa.com`
- `karla.contreras@empresa.com`
- `gabriel.martinez@empresa.com`
- `alejandro.cruz@empresa.com`
- `lorena.arriola@empresa.com`

Password de todos los organizadores:

- `Organizador123`

> Las cuentas anteriores existen solo si se ejecutaron los seeds de backend (`seed_admin.py` y `seed_events.py`).

---

## 6. Rutas principales del frontend

- `/login`: inicio de sesion (ADMIN u ORGANIZADOR)
- `/register`: registro de nuevos organizadores
- `/organizador`: panel del organizador
- `/admin`: dashboard general ADMIN
- `/admin/eventos`: gestion global de eventos
- `/admin/personas`: gestion de usuarios y asistentes

---

## 7. Flujo de autenticacion

Endpoints principales consumidos por frontend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Comportamiento de la app:

- Guarda token y usuario en el store de autenticacion.
- Restaura sesion en pantallas protegidas.
- Redirige por rol:
  - ADMIN -> `/admin`
  - ORGANIZADOR -> `/organizador`

---

## 8. Pruebas recomendadas por rol

### 8.1 Organizador

1. Login con una cuenta `@empresa.com`.
2. Crear evento en `/organizador/eventos/nuevo`.
3. Ver detalle de evento e inscripciones.
4. Editar evento en `/organizador/eventos/[eventId]/editar`.
5. Cancelar evento y validar estado `CANCELADO`.

### 8.2 Admin

1. Login con `admin@admin.com`.
2. Revisar dashboard en `/admin`.
3. Probar filtros y cambio de estado en `/admin/eventos`.
4. Revisar usuarios/asistentes en `/admin/personas`.

---

## 9. Checklist de verificacion rapida

- El login de admin funciona.
- El login de organizador funciona.
- Carga el dashboard de admin.
- Carga el panel de organizador.
- Se puede crear al menos un evento.

---

## 10. Troubleshooting

1. Error de conexion con API:
   - Verifica que backend este arriba y que `NEXT_PUBLIC_API_BASE_URL` sea correcta.
2. Cambiaste `.env.local` y no toma cambios:
   - Reinicia `npm run dev`.
3. 401/403 en rutas protegidas:
   - Cierra sesion e inicia sesion de nuevo para refrescar token.
4. Puerto 3000 ocupado:
   - Libera el puerto o ejecuta frontend en otro puerto.

---

## 11. Notas de desarrollo

- El frontend usa App Router en `app/`.
- Existen carpetas en `src/` para componentes, servicios, hooks y store.
- La comunicacion con backend se centraliza en `src/services`.
- Para cambios de API, revisar `backend/API_DOCUMENTATION.md` y ajustar servicios del frontend.

---

## 12. Referencias

- Documentacion API backend: `backend/API_DOCUMENTATION.md`
- Coleccion Postman: `backend/postman/proyecto_final_arqui.postman_collection.json`