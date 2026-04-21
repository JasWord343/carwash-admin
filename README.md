<<<<<<< HEAD
# carwash-admin
=======
# CarWash Admin

Panel administrativo para un car wash construido con React, Vite y Tailwind.

## Que trae esta version

- Ya no depende de Base44 ni de servicios externos.
- Guarda informacion en `localStorage`, asi que puedes usarla sin backend.
- Incluye datos de ejemplo para clientes, citas, servicios, pagos, gastos y presupuestos.

## Como iniciar

1. Instala dependencias con `npm install`
2. Ejecuta `npm run dev`
3. Abre la URL local que te muestre Vite

## Como publicar

Es una app frontend normal de Vite, asi que puedes publicarla en cualquier hosting estatico:

- Netlify
- Vercel
- Cloudflare Pages
- cPanel o hosting tradicional subiendo la carpeta `dist`

Para generar la version de produccion:

```bash
npm run build
```

## Nota sobre los datos

Los registros se guardan en el navegador donde abras la app. Si mas adelante quieres que varios usuarios compartan informacion, el siguiente paso es conectar una API o una base de datos real.
>>>>>>> 6d019a9 (feat: carwash admin app)
