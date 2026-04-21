# Supabase Setup

## 1. Crear el proyecto

1. Crea un proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Ejecuta el archivo `supabase/schema.sql`.

## 2. Crear usuarios

1. Ve a `Authentication`.
2. Activa `Email` provider.
3. Crea los usuarios de tu equipo.

## 3. Variables de entorno

En local:

1. Copia `.env.example` a `.env`
2. Completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

En Cloudflare Pages:

1. Ve a tu proyecto.
2. `Settings` -> `Environment variables`.
3. Agrega las mismas dos variables para `Production` y `Preview`.

## 4. Siguiente paso en la app

La app todavia usa `localStorage` como fuente principal. El siguiente cambio es migrar el acceso a datos para leer y escribir en Supabase:

- `clients`
- `services`
- `packages`
- `appointments`
- `payments`
- `expenses`
- `daily_services`
- `budgets`

## 5. Recomendacion

Cuando tengas las claves del proyecto:

- URL del proyecto
- anon key

ya se puede conectar la app y reemplazar el almacenamiento local por la base compartida.
