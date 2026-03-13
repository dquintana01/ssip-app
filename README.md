# SSIP — Instrucciones de deploy

## Paso 1 — Crear tablas en Supabase

1. Entrá a supabase.com → tu proyecto
2. Menú izquierdo → **SQL Editor** → **New query**
3. Copiá todo el contenido del archivo `supabase_tablas.sql`
4. Hacé clic en **Run**
5. Deberías ver "Success" en verde

---

## Paso 2 — Subir el código a GitHub

1. Entrá a github.com → **New repository**
2. Nombre: `ssip-app`
3. Dejalo en **Public** → **Create repository**
4. Seguí las instrucciones de GitHub para subir los archivos
   (GitHub te va a mostrar los comandos exactos)

---

## Paso 3 — Deploy en Vercel

1. Entrá a vercel.com → **Add New Project**
2. Conectá con tu repositorio `ssip-app` de GitHub
3. Antes de hacer deploy, agregá las variables de entorno:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu publishable key
4. Hacé clic en **Deploy**
5. En 2 minutos tenés la URL pública

---

## Estructura del proyecto

```
ssip-app/
├── index.html
├── vite.config.js
├── package.json
├── .env              ← NO subir a GitHub (ya está en .gitignore)
├── supabase_tablas.sql
└── src/
    ├── main.jsx
    ├── index.css
    ├── supabase.js
    └── App.jsx
```

---

## Variables de entorno necesarias en Vercel

| Variable | Valor |
|----------|-------|
| VITE_SUPABASE_URL | https://mkbzxwethctfoavurric.supabase.co |
| VITE_SUPABASE_ANON_KEY | sb_publishable_ksqux_... |
