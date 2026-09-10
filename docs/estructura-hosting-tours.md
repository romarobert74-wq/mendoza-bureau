# Estructura de hosting de los tours — Mendoza Bureau

> Info operativa: dónde cuelga Mendoza Bureau los tours 360° de cada socio.
> En base a esta estructura se arman los **links de los socios** (URL interna del tour)
> y se les pasan los archivos del **tour madre** para que lo suban ahí.

## Servidor / dominio

- **Base:** `https://mendozabureau360.com/`
- Servidor con **autoindex** (muestra "Index of /") — hosting propio de Bureau
  (Don Web), no Vercel. Acá viven SOLO los tours 3DVista (HTML/panorámicas),
  no la plataforma/sistema (eso está en Vercel).

## Carpetas (raíz), relevado 2026-09-07

| Carpeta                      | Contenido / categoría del sistema                              |
|------------------------------|----------------------------------------------------------------|
| `bodegas&resto/`             | Bodegas (y restaurantes de bodega)                             |
| `hoteles/`                   | Hoteles                                                        |
| `hoteles-venues/`            | Hoteles con salones / venues para eventos                     |
| `restaurantes/`              | Restaurantes                                                  |
| `servicios-opc-ope/`         | Organización de Congresos y Eventos (OPC/OPE) → `eventos`     |
| `servicios-tecnologia…/`     | Tecnología, Audiovisual y Exposiciones → `tecnologia` (*)     |
| `servicios-transporte/`      | Transporte y Logística → `transporte`                         |
| `servicios-agencias/`        | Viajes y Turismo (agencias) → `viajes`                        |
| `convenios-municipios/`      | Convenios con municipios                                       |
| `test.txt`                   | Archivo de prueba (ignorar)                                   |

(*) El nombre de la carpeta de tecnología aparece truncado en el índice
(`servicios-tecnologia..>`). **Confirmar el nombre exacto** de esa carpeta antes
de armar links que la referencien.

## Correspondencia carpeta ↔ categoría del sistema

- `bodega`      → `bodegas&resto/`
- `restaurante` → `restaurantes/` (o `bodegas&resto/` si es resto de bodega)
- `hotel`       → `hoteles/` o `hoteles-venues/` (si tiene salones)
- `salon`       → `hoteles-venues/`
- `eventos`     → `servicios-opc-ope/`
- `tecnologia`  → `servicios-tecnologia…/`
- `transporte`  → `servicios-transporte/`
- `viajes`      → `servicios-agencias/`

## Cómo se arma el link de un socio (URL interna del tour)

Patrón previsto:

```
https://mendozabureau360.com/<carpeta-categoria>/<slug-del-socio>/
```

Ejemplos:
- Hotel Diplomatic → `https://mendozabureau360.com/hoteles/hotel-diplomatic/`
- Bodega Norton    → `https://mendozabureau360.com/bodegas&resto/bodega-norton/`

> El campo **"URL interna — Ida"** de la ficha del socio (solo visible para El Faro)
> se completa con este link. La **"URL interna — Vuelta"** apunta de regreso al tour madre.

## Pendientes

- Confirmar nombre exacto de la carpeta de tecnología (truncada en el índice).
- Definir convención de **slug** por socio (minúsculas, sin acentos, con guiones).
- Pasar a Bureau los archivos del **tour madre** para que los suban a este servidor.
