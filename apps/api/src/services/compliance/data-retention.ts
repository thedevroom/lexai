/** Política de retención de datos LexAI — RGPD */

export const DATA_RETENTION_POLICY = {
  version: '1.0',
  effectiveDate: '2026-06-15',
  rules: [
    {
      dataType: 'consultations',
      retentionDays: 730,
      description: 'Consultas y mensajes: 2 años desde última actividad del expediente',
    },
    {
      dataType: 'documents',
      retentionDays: 1095,
      description: 'Documentos cifrados: 3 años o hasta eliminación por el usuario',
    },
    {
      dataType: 'audit_logs',
      retentionDays: 2555,
      description: 'Logs de auditoría: 7 años (obligación legal/compliance)',
    },
    {
      dataType: 'consent_records',
      retentionDays: 2555,
      description: 'Registros de consentimiento: 7 años tras revocación',
    },
    {
      dataType: 'voice_transcripts',
      retentionDays: 365,
      description: 'Transcripciones de voz: 1 año con consentimiento explícito',
    },
  ],
  userRights: [
    'Art. 15 — Derecho de acceso',
    'Art. 16 — Derecho de rectificación',
    'Art. 17 — Derecho de supresión (olvido)',
    'Art. 20 — Derecho a la portabilidad',
    'Art. 21 — Derecho de oposición',
  ],
} as const;