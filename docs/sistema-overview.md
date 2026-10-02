# Resumen del Sistema — Mendoza Bureau

> Mapa completo del sistema para referencia rápida (evita re-escanear todo).
> Estado al **2026-10-02**. Actualizar cuando haya cambios estructurales.

## Qué es
Plataforma de **tours virtuales 360°** para los socios de Mendoza Bureau, producida junto a **El Faro 360**. Incluye: panel de administración, fichas de socios, web institucional, bot IA, analíticas de tours y una landing comercial. Los tours 3DVista se hostean aparte (en `mendozabureau360.com`, lo maneja Pablo/Bureau) y embeben páginas de este sistema vía webframes.

## Stack
- **Next.js 14.2** (App Router, `'use client'`), **React 18**, TypeScript.
- **Firebase 10** (Auth + Firestore) cliente + **firebase-admin 14** (server).
- **@anthropic-ai/sdk** (bot IA, modelo `claude-haiku-4-5`).
- **xlsx** (export Excel), **lucide-react** (iconos), **react-hot-toast**.
- Deploy en **Vercel**. Repo GitHub: `romarobert74-wq/mendoza-bureau`.
- Branches: `develop` (trabajo) → `main` (producción). Merge cuando el usuario dice "merge".
- URL prod actual: `mendoza-bureau.vercel.app` (a migrar a subdominio propio; ver roadmap-seguridad.md).

## Roles de usuario
- **`el_faro`** — superadmin (El Faro 360). Acceso total, incluido backups, chat IA, usuarios, config.
- **`bureau`** — admin Bureau. Socios, inscripciones, web institucional.
- **`socio`** — acceso limitado (dashboard básico).

---

## Rutas / Páginas

### Públicas
- `/` — home.
- `/login` — ingreso (Firebase Auth email/password).
- `/plataforma` — **landing comercial** para captar socios. Modal de inscripción (lead), ejemplos de tours (Hilton, Smart Congresses, Bodega Margot), servicios adicionales, FAQ. WhatsApp Bureau: `5492616564336`.
- `/servicios-adicionales` — detalle de servicios.
- `/salones` — salones de eventos.
- `/form/socio` — **formulario del socio** (circula por WhatsApp). Con `?id=` edita (vía `/api/socio-editar`); sin id crea nuevo (`crearSocio`, cliente). *(ver Parte 2 del roadmap de seguridad)*
- `/web_bureau` — web institucional pública.

### Tour (embebidas en 3DVista vía webframe)
- `/tour/ir-a/[socioId]` — **botonera** de navegación del tour (botón "Ir a"). X de cerrar naranja con pulso.
- `/tour/socio/ficha?id=...` — **ficha técnica** del socio dentro del tour. X de cerrar naranja con pulso.
- `/tour/menu` — menú del tour (contacto, info, redes). Botones WhatsApp/Email/Web.
- `/tour/chat` — bot IA dentro del tour.
- `/tour/socio/{contacto,fotos,info,salon,ubicacion}` — sub-vistas de la ficha.
- `/tour/salones`, `/tour/botones`, `/tour/botones-demo`, `/tour/ir-a-test` — auxiliares/demo.

### Dashboard (menú lateral — `src/app/dashboard/layout.tsx`)
| Ruta | Label | Roles |
|---|---|---|
| `/dashboard` | Dashboard (métricas, card Tour Madre) | todos |
| `/dashboard/socios` | Socios (lista, alta, copiar links) | el_faro, bureau |
| `/dashboard/socios/nuevo` | Nuevo socio | el_faro, bureau |
| `/dashboard/socios/[id]` | Editar socio | el_faro, bureau |
| `/dashboard/socios/[id]/ver` | Ver socio (panoramas más vistos) | el_faro, bureau |
| `/dashboard/inscripciones` | Inscripciones (leads landing + **export Excel**) | el_faro, bureau |
| `/dashboard/tour-madre` | Tour Madre (URLs internas por socio) | el_faro |
| `/dashboard/web-bureau` | Web Institucional | el_faro, bureau |
| `/dashboard/chat-ia` | Chat IA (config bot, conocimiento) | el_faro |
| `/dashboard/conversaciones` | Conversaciones del bot | el_faro |
| `/dashboard/usuarios` | Usuarios | el_faro |
| `/dashboard/backups` | Copias de seguridad + reiniciar analíticas | el_faro |
| `/dashboard/configuracion` | Configuración (categorías, tour madre, logo) | el_faro |

---

## API Routes (`src/app/api/`)
- `/api/track` — recibe eventos de analítica desde los tours (CORS `*`, Admin SDK + fallback cliente). Tipos: tour, webframe_tiempo, panorama, menu_abierto, bot_abierto, contacto, web, redes.
- `/api/inscripcion` — guarda lead de la landing en `inscripciones` (Admin SDK + fallback).
- `/api/socio-editar` — actualiza socio EXISTENTE (Admin SDK + lista blanca de campos). Solo update, no crea.
- `/api/socio/[id]` — lee datos de un socio (con `?t=` anti-cache).
- `/api/socios-menu` — datos de socios para el menú del tour.
- `/api/socios-public` — datos públicos de socios.
- `/api/chat` — bot IA (Anthropic). `/api/chat-config` — config del bot.

---

## Colecciones Firestore
- `socios` — socios + subcolección `fotos`. **Lectura pública**, creación abierta (a cerrar), edición interna. Fotos como **base64 (data URL)** embebidas (no usa Firebase Storage).
- `usuarios` — cuentas + rol. Lectura propia o admin; crea/borra el_faro.
- `configuracion/*` — categorías, tour madre, logo, `chatbot` (conocimiento), `chatbot_uso`, `migracion`. Mayoría lectura pública salvo sensibles.
- `inscripciones` — leads de la landing. Create abierto (a cerrar), read/update/delete interno.
- `analytics` — eventos de tours. `create: if false` (solo Admin SDK), lectura autenticada.
- `chat_logs` — conversaciones del bot (solo Admin SDK escribe).
- `web_bureau`, `web_bureau_prensa`, `web_bureau_observatorio` — contenido institucional.
- `backups` — copias de seguridad (solo el_faro).

> Reglas en `firestore.rules`. **No se deployan solas**: el usuario las publica a mano en la consola de Firebase.

---

## Categorías de socio (`src/types/index.ts`)
`bodega`, `restaurante`, `hotel`, `alojamiento`, `salon` (Salón de Eventos), `servicio`, `eventos` (OPC/OPE), `tecnologia` (Audiovisual y Exposiciones), `transporte` (y Logística), `viajes` (y Turismo), `otro`.
Subcategorías de hotel: boutique, resort, business, apart, rural, otro.
Colores por categoría en `CATEGORIA_COLOR`.

---

## Librerías internas (`src/lib/`)
- `firebase.ts` — init cliente (Auth, Firestore, App Check/reCAPTCHA, Analytics).
- `firebaseAdmin.ts` — Admin SDK server-only (`getAdminDb()`, usa `FIREBASE_SERVICE_ACCOUNT`).
- `firestore.ts` — CRUD de socios, inscripciones, analíticas, backups, config, web institucional.
- `analytics.ts` — `trackEvento()` → POST a `/api/track`.
- `storage.ts` — redimensiona imágenes en el navegador y las guarda como **data URL** (sin Storage pago).
- `serviciosAdicionales.ts` — datos de servicios.

## Componentes (`src/components/`)
`SocioForm`, `SocioFotos`, `SalonesEditor`, `CategoryEditor`, `DocumentacionSection`, `LandingServiciosSection`, `BrandLogos`, `BackLink`, `VersionBadge`.

## Context (`src/context/`)
`AuthContext` (usuario + rol + loading), `ThemeContext`.

---

## 3DVista (`public/3dvista/`)
Scripts que se pegan en 3DVista ("Al comenzar" → Ejecutar JavaScript). **100% ASCII** (regex como `new RegExp('...')`, nunca literal, para no corromperse al pegar). Listener de mensajes PRIMERO; tracking envuelto en try/catch y diferido, para que el cierre nunca dependa del tracking.
- `puente-socio.js` — tours de socios: navegación "Ir a" por nombre + cerrar botonera/ficha (X) + tracking.
- `puente-madre.js` — tour madre: solo estadísticas.
- `puente-ir-a.js` — versión completa del puente socio.
- `onboarding.html`, `onboarding-card.html` — pantallas de bienvenida del tour madre.

Mensajes postMessage: `source: 'bureau-ir-a'`, tipos `mb-ir-a`, `mb-cerrar-ir-a`, `mb-cerrar-ficha`.

---

## Variables de entorno (13)
Firebase cliente (7): `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,STORAGE_BUCKET,MESSAGING_SENDER_ID,APP_ID,MEASUREMENT_ID}`.
Server: `FIREBASE_SERVICE_ACCOUNT` (secreto, Admin SDK), `ANTHROPIC_API_KEY` (bot).
App Check: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_APPCHECK_DEBUG`.
Entorno: `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_APP_BRANCH`.

## Datos de contacto hardcodeados
- WhatsApp principal Bureau: `5492616564336`. Otros: `5492614001000`, `5492616657058`.
- Emails: `info@`, `coordinador@`, `secretario@mendozabureau.com`.

## Firebase project
`.firebaserc` → default: `mendoza-bureau`.

---

## Docs relacionados
- `docs/roadmap-seguridad.md` — plan de seguridad y migración (dominio propio, cierre de reglas, módulo ciberseguridad, transferencia de cuentas).
- `docs/estructura-hosting-tours.md` — estructura de hosting de los tours en mendozabureau360.com.
