# Roadmap de Seguridad y Migración — Mendoza Bureau

> Documento de referencia. Estado al **2026-10-02**. Se va actualizando a medida que avanzamos.
> Orden de ejecución pensado para **no hacer doble trabajo**: primero el dominio, después ciberseguridad.

---

## PASO 0 — Subdominio propio (PRIMERO, depende de Pablo/Bureau)

**Por qué primero:** la URL `mendoza-bureau.vercel.app` está hardcodeada en el código y, sobre todo, **dentro de cada webframe de cada tour en 3DVista**. Si migramos el hosting sin un dominio propio, hay que re-editar todos los tours. Con un subdominio propio (apuntado por DNS), la migración futura es solo repuntar el DNS → cero re-trabajo.

**Qué pedirle a Pablo:** crear un subdominio de Bureau (ej. `app.mendozabureau.com`) y apuntarlo a Vercel con un **CNAME** (el valor exacto lo da Vercel en Settings → Domains).

**Checklist una vez creado el subdominio:**
- [ ] Agregar el dominio en Vercel (Settings → Domains) y pasar el CNAME a Pablo.
- [ ] Centralizar la URL base en el código en una variable `NEXT_PUBLIC_BASE_URL`
      (hoy está hardcodeada a vercel en ~10 lugares; ver sección "URLs hardcodeadas").
- [ ] Re-pegar la URL nueva en los **webframes de los 2 tours** de 3DVista (botonera + ficha). *(una sola vez)*
- [ ] Firebase Auth → **Dominios autorizados**: agregar el dominio nuevo (si no, se rompe el login).
- [ ] reCAPTCHA / App Check: agregar el dominio nuevo a la config (la site key es por dominio).

### URLs hardcodeadas a cambiar (centralizar en `NEXT_PUBLIC_BASE_URL`)
- `src/components/SocioForm.tsx` → link webframe "Ir a".
- `src/app/dashboard/socios/[id]/page.tsx` y `.../ver/page.tsx` → `const BASE`.
- `src/components/DocumentacionSection.tsx` → `const APP`.
- `src/app/dashboard/socios/page.tsx` → copiar link ficha (usa `location.origin` con fallback vercel).
- `src/app/tour/menu/page.tsx` → link a `/web_bureau`.
- `public/3dvista/puente-ir-a.js`, `puente-socio.js`, `puente-madre.js` → `TRACK_URL` (`/api/track`).

> **Nota:** las URLs de ficha/botonera **viven físicamente dentro del tour 3DVista** (pegadas a mano). El código solo genera el texto para copiar. Por eso, tras cambiar el código, hay que **re-pegar una vez** en cada tour. Con el subdominio, es la última vez.

---

## CIBERSEGURIDAD — Plan mínimo por partes (en stand-by hasta terminar el PASO 0)

Contexto legal: **Ley 9726 de Ciberseguridad de Mendoza** (vigente). Apunta al Estado y a terceros que prestan servicios/custodian datos *para el Estado*. Bureau = socios privados con datos públicos → hoy **no obligatorio**, pero sí aplica el **Art. 34** (recomendaciones al sector privado) y la **Ley Nacional 25.326** de datos personales. Alinearse = ventaja para trabajar con municipios/Estado.

**Dato clave (por qué antes falló cerrar las reglas):** al cerrar un `create`, el formulario sigue andando **solo si escribe por el servidor con Admin SDK** (saltea reglas). Hoy el Admin SDK **funciona en prod** (prueba: `analytics` ya está con `create: if false` y las métricas se registran igual). Por eso **ahora sí se puede cerrar sin romper**.

### 🟢 Parte 1 — Inscripciones
- El form ya escribe por `/api/inscripcion` con Admin SDK.
- **Decisión pendiente del usuario:** ¿se elimina esa landing (no la están usando) o se cierra?
- Si se cierra: en `firestore.rules`, `inscripciones` → `create: if false`. Mantiene dashboard + export Excel.

### 🟡 Parte 2 — Socios
- Hoy el form público, al crear un socio **nuevo**, escribe **directo desde el cliente** (`crearSocio` en `firestore.ts`) → por eso la regla está abierta (`create: if true`).
- Plan: crear `/api/socio-crear` (Admin SDK + lista blanca de campos, igual que `/api/socio-editar`), que el form use esa API, y cerrar `socios` → `create: if false`.
- **NO tocar** `read: if true` (el tour y la web necesitan leer sin login).

### 🟡 Parte 3 — Ficha (form público que circula por WhatsApp)
- [ ] Checkbox **"Acepto términos y condiciones"** obligatorio para enviar (cubre Ley 25.326).
- [ ] Activar **App Check "Enforce"** en consola de Firebase (frena bots sin captcha visible).

### ⏸️ Diferido (decisión del usuario)
- 2FA para admins (hoy admin único = el usuario).
- Rate limit en APIs públicas (`/api/inscripcion`, `/api/track`).
- Política de privacidad (Ley 25.326).

---

## FUTURO — Módulo "Ciberseguridad" en el sistema (idea del usuario)

Nuevo menú en el dashboard con:
- **Checklists** de seguridad.
- **Log de ataques/incidentes** recibidos.
- **Log de auditoría por usuario**: quién cargó/editó/borró qué y cuándo. *(cubre el Art. 22 de la ley)*

---

## TRANSVERSAL — Migración a servidores de Bureau (~2 años)

- Entregar a Bureau: **GitHub + Vercel + Firebase + sistema de administración**.
- **Recomendado:** *transferir* las cuentas (no recrear) → se conserva todo (IDs, usuarios, fotos, reglas).
  - GitHub: transferir repo a cuenta/org de Bureau.
  - Vercel: transferir proyecto + recargar las variables de entorno.
  - Firebase: transferir el proyecto (Google Cloud → IAM → agregar a Bureau como Propietario).
- Si fuera proyecto Firebase nuevo: export/import de Firestore **conservando los document IDs**.
- Ventaja: las **fotos se guardan como base64 dentro de Firestore** → no hay bucket de Storage aparte que migrar.
- **Regla de oro:** de ahora en adelante, todo lo nuevo se hace contemplando el cambio de dominio (nada atado a `vercel.app`).

---

## Estado de seguridad actual (resumen del análisis)

**🟢 Ya está bien:** cifrado en reposo (Firestore), HTTPS, secretos en variables de entorno, `analytics`/`chat_logs` cerrados (solo Admin SDK), edición de socios por API con validación.

**🔴 A tapar:** escritura pública abierta en `socios` e `inscripciones` (`create: if true`); App Check configurado pero **sin Enforce**.

**🟠 Mejoras:** 2FA, rate limit, log de auditoría, publicar reglas siempre que se cambien.

**Sobre cifrar campos:** prioridad baja. Los datos de socios son públicos (no tiene sentido cifrarlos); Firestore ya cifra en reposo. Solo valdría cifrado selectivo de WhatsApp/email de leads como defensa en profundidad.
