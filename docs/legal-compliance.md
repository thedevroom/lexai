# LexAI v2 — Cumplimiento Legal y RGPD

**Versión:** 1.0  
**Fecha efectiva:** 15 de junio de 2026

## Política de retención de datos

| Tipo de dato | Retención | Descripción |
|--------------|-----------|-------------|
| Consultas y mensajes | 2 años (730 días) | Desde la última actividad del expediente |
| Documentos cifrados | 3 años (1.095 días) | O hasta eliminación explícita por el usuario |
| Logs de auditoría | 7 años (2.555 días) | Obligación legal y compliance |
| Registros de consentimiento | 7 años (2.555 días) | Tras revocación o cierre de cuenta |
| Transcripciones de voz | 1 año (365 días) | Con consentimiento explícito de grabación |

## Derechos del interesado (RGPD)

- **Art. 15** — Derecho de acceso
- **Art. 16** — Derecho de rectificación
- **Art. 17** — Derecho de supresión (olvido)
- **Art. 20** — Derecho a la portabilidad
- **Art. 21** — Derecho de oposición

## Implementación técnica

### Consentimiento explícito

Registrado en onboarding vía `compliance.recordConsents` con IP, user-agent y versión de política. Tipos: Términos, Privacidad, Procesamiento IA, Cookies analíticas (opcional), Marketing (opcional).

### Cifrado de documentos

- Algoritmo: AES-256-GCM (envelope encryption)
- DEK única por usuario, envuelta con KEK (`ENCRYPTION_MASTER_KEY`)
- Almacenamiento: Cloudflare R2 (producción) o `.local-storage/` (desarrollo)

### Exportación de datos (Art. 20)

Endpoint: `compliance.exportUserData` — genera JSON con perfil, expedientes, consultas, documentos (metadatos), consentimientos y últimos 500 logs de auditoría.

### Eliminación de cuenta (Art. 17)

Endpoint: `compliance.deleteAccount` — requiere confirmación textual `ELIMINAR MI CUENTA`. Borra objetos R2/local y elimina usuario con cascada Prisma (expedientes, consultas, documentos, consentimientos).

### Auditoría

Tabla `AuditLog` registra: creación de expediente, consulta, mensaje, subida de documento, consentimiento, exportación y eliminación.

### Anti-abuse

Detección de patrones de actividad ilegal en consultas. Rate limiting reforzado (15 req/min) en áreas penal y fiscal.

## Activación IA (xAI Grok)

La integración con Grok se activa automáticamente al configurar `XAI_API_KEY` en el entorno. Sin clave, el sistema opera en modo mock con disclaimers completos.