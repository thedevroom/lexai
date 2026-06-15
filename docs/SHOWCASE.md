# Showcase — LexAI v2

Material visual y flujos destacados del producto para README, redes y presentaciones.

## Assets del repositorio

| Archivo | Uso |
|---------|-----|
| `.github/assets/banner.png` | Banner README + social preview GitHub |
| `.github/assets/dashboard-preview.png` | Vista previa dashboard en README |

## Flujos destacados

### 1. Landing + demo interactiva

- Hero con propuesta de valor
- Sección `#demo` — demo 60s con Framer Motion
- Grid de 9 áreas jurídicas
- Pricing, FAQ, comparativa

**Ruta:** `/` → `#demo`

### 2. Consulta jurídica (dashboard)

- Chat con memoria de expediente
- Respuesta IRAC estructurada
- Citas legales y semáforo de riesgo
- Disclaimers según área (penal/fiscal reforzados)

**Ruta:** `/dashboard/chat/[caseId]`

### 3. Panel administración

- Métricas de usuarios
- Gestión de roles
- Logs de auditoría RGPD

**Ruta:** `/admin`

### 4. Cumplimiento legal

- Banner cookies con consentimiento granular
- Términos, privacidad, cookies, aviso legal
- Registro de consentimientos en API

**Rutas:** `/legal/*`

## Paleta de marca

| Token | Valor | Uso |
|-------|-------|-----|
| Fondo | `#0A0A0A` | Base dark |
| Acento | `#C5A46E` | Oro legal, CTAs |
| Texto | `#FAFAFA` | Cuerpo |
| Muted | `#A1A1AA` | Secundario |

## Tipografías

- **Inter Tight** — display
- **Inter** — UI y cuerpo
- **Playfair Display** — titulares legales

## Cómo actualizar capturas

1. Ejecuta `pnpm start` en local
2. Captura en 1920×1080 o usa las assets generadas
3. Sustituye archivos en `.github/assets/`
4. Commit: `docs: update showcase assets`