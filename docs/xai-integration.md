# LexAI v2 — Integración xAI (Grok)

**Última actualización:** 15 de junio de 2026

## Resumen

LexAI usa xAI Grok para razonamiento jurídico en producción, con degradación automática a un **motor local inteligente** cuando no hay créditos, falla la API o la consulta es simple.

```
consultations.sendMessage
  → processConsultationMessage()          [apps/api]
    → processConsultation()               [packages/ai]
      ├─ Caché (24h, 500 entradas)
      ├─ Sin XAI_API_KEY → lexai-local
      ├─ XAI_FORCE_MOCK=true → lexai-local
      ├─ Consulta simple → lexai-local (ahorro de coste)
      ├─ Consulta compleja + créditos → Grok live (grok-4.3)
      └─ Error Grok (403, timeout…) → lexai-local-fallback
```

## Modos de ejecución

| Modo | `executionMode` | `modelUsed` | Cuándo |
|------|-----------------|-------------|--------|
| Live | `live` | `grok-4.3` (o alias) | API key válida + créditos + consulta compleja |
| Local | `mock` | `lexai-local` | Sin key, force mock, consulta simple, o caché |
| Fallback | `fallback` | `lexai-local-fallback` | Grok intentado pero falló |
| Caché | `mock` | `cache` | Misma consulta+área en 24h |

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `XAI_API_KEY` | Clave de [console.x.ai](https://console.x.ai) | — |
| `XAI_HEAVY_MODEL` | Modelo para consultas complejas | `grok-4.3` |
| `XAI_VOLUME_MODEL` | Modelo volumen (futuro) | `grok-4.3` |
| `XAI_API_BASE` | Endpoint API | `https://api.x.ai/v1` |
| `XAI_FORCE_MOCK` | `true` = nunca llamar Grok aunque haya key | `false` |

**Nunca hardcodear la clave en código.**

## Activar modo live

1. Crear equipo en [console.x.ai](https://console.x.ai)
2. Añadir método de pago o créditos de trial
3. Generar API key
4. Añadir a `.env`: `XAI_API_KEY=xai-...`
5. Reiniciar API: `pnpm --filter @lexai/api dev`
6. Verificar: `consultations.getAiStatus` → `mode: 'live'`

## Opciones gratuitas o de bajo coste (investigación 2026)

### Realidad: no hay tier 100% gratuito sostenible

La documentación oficial de xAI ([pricing](https://docs.x.ai/developers/pricing)) **no ofrece un free tier permanente**. Todo uso de API es de pago por token.

### Opciones reales para reducir coste a ~0€ inicial

| Opción | Crédito estimado | Sostenible | Notas |
|--------|------------------|------------|-------|
| Trial console.x.ai (cuenta nueva) | $25–$150 | No (30–90 días) | Requiere registro; equipos nuevos sin créditos dan 403 |
| Programas startup (YC, AWS Activate, etc.) | $500–$5.000+ | 6–12 meses | xAI aparece como perk en bundles, no programa público propio |
| Batch API xAI | 20–50% descuento | Sí | Para tareas no urgentes (hasta 24h) |
| `grok-build-0.1` | $1/$2 por 1M tokens | Sí | Más barato que grok-4.3 para código |
| Motor local LexAI | $0 | Sí | Implementado — cubre consultas simples y sin créditos |

### Proveedores intermediarios

| Proveedor | Tier gratuito | Grok disponible |
|-----------|---------------|-----------------|
| OpenRouter | Créditos iniciales mínimos | Sí (con markup) |
| Together AI | Trial limitado | Algunos modelos Grok |
| Azure / GCP / Oracle | Créditos cloud startup | Grok vía marketplace (de pago) |

**No recomendamos depender de intermediarios gratuitos** para producción legal: markup, latencia y términos variables.

### Estrategia recomendada para LexAI

1. **Desarrollo sin coste:** `XAI_FORCE_MOCK=true` o sin key → motor local inteligente
2. **Producción inicial:** Trial $25–150 + routing por complejidad (ya implementado)
3. **Escala:** Batch API para análisis de documentos no urgentes
4. **Coste estimado producción:** ~$0.002–0.01 por consulta simple con grok-4.3 (1–3K tokens)

## Motor local inteligente (sin Grok)

Cuando no hay créditos, el paquete `@lexai/ai` genera respuestas estructuradas con:

- Detección de temas por área (despido, divorcio, multa, IVA, etc.)
- Plazos legales frecuentes (20 días despido, reposición AEAT…)
- Legislación citada (ET, LEC, CP, LGT…)
- IRAC completo
- Disclaimers por área (reforzados en penal/fiscal)

Archivo: `packages/ai/src/methods/intelligent-mock.ts`

## Ahorro de coste con créditos limitados

### Routing automático (`grok-routing.ts`)

Consultas **simples** (< 80 chars, sin keywords complejas) → motor local aunque haya créditos.

Consultas **complejas** (recursos, litigios, textos largos) → Grok live.

### Caché (`response-cache.ts`)

- Misma consulta + área → respuesta cacheada 24h
- Máximo 500 entradas en memoria
- Aplica a respuestas live y fallback

### Forzar mock en desarrollo

```env
XAI_FORCE_MOCK=true
```

## Modelos y precios (junio 2026)

| Modelo | Input / 1M | Output / 1M | Uso LexAI |
|--------|------------|-------------|-----------|
| `grok-4.3` | $1.25 | $2.50 | Consultas jurídicas (default) |
| `grok-build-0.1` | $1.00 | $2.00 | Generación de código/escritos |
| `grok-4.20-*` | $1.25 | $2.50 | Alternativa reasoning |

## Verificación

```bash
# Estado sin llamar Grok
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/trpc/consultations.getAiStatus

# Prueba directa (desde apps/api)
node scripts/test-grok-direct.mjs
```

## Errores comunes

| Error | Causa | Acción |
|-------|-------|--------|
| 403 permission-denied (no credits) | Equipo sin créditos | Añadir créditos en console.x.ai |
| 400 Model not found | Modelo incorrecto | Usar `grok-4.3` |
| Fallback automático | Cualquier error Grok | Normal — motor local responde |

## Seguridad

- La API key solo en `.env` (gitignored)
- Logs no incluyen claves ni contenido PII de consultas
- Anti-abuse bloquea consultas ilegales antes de llamar Grok