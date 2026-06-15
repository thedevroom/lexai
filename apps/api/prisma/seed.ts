import {
  PrismaClient,
  LegalArea,
  UserPlan,
  SubscriptionStatus,
  CaseStatus,
  CasePriority,
  ConsultationStatus,
  MessageRole,
  DocumentSemaphore,
  LegalDocumentType,
  DeadlineUrgency,
  DeadlineStatus,
  TimelineEventType,
  VoiceSessionStatus,
  ConsentType,
  AuditAction,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data definitions
// ─────────────────────────────────────────────────────────────────────────────

const LEGAL_AREA_CASES: Array<{
  area: LegalArea;
  title: string;
  description: string;
  priority: CasePriority;
  status: CaseStatus;
}> = [
  {
    area: LegalArea.LABORAL,
    title: 'Despido improcedente — Empresa Logística Ibérica S.L.',
    description:
      'El trabajador fue despedido tras 8 años de antigüedad sin carta de despido formal. Se reclama la improcedencia y indemnización.',
    priority: CasePriority.HIGH,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.CIVIL,
    title: 'Reclamación de cantidad — Impago factura servicios',
    description:
      'Factura de 12.450 € impagada por cliente habitual. Se prepara demanda monitoria.',
    priority: CasePriority.MEDIUM,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.PENAL,
    title: 'Denuncia por estafa — Compra online fraudulenta',
    description:
      'Estafa de 3.200 € en marketplace. Se ha interpuesto denuncia y se solicita asistencia letrada.',
    priority: CasePriority.HIGH,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.FAMILIA,
    title: 'Procedimiento de divorcio contencioso',
    description:
      'Divorcio con menores. Disputa sobre custodia compartida y pensión de alimentos.',
    priority: CasePriority.MEDIUM,
    status: CaseStatus.ON_HOLD,
  },
  {
    area: LegalArea.FISCAL,
    title: 'Recurso de reposición — Liquidación IVA',
    description:
      'Liquidación provisional de IVA del Q3 2025 por discrepancia en modelo 303.',
    priority: CasePriority.MEDIUM,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.TRAFICO,
    title: 'Recurso multa — Exceso de velocidad A-6',
    description:
      'Multa de 200 € y 2 puntos. Se alega error en la señalización del radar.',
    priority: CasePriority.LOW,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.CONSUMIDOR,
    title: 'Reclamación — Producto defectuoso electrodoméstico',
    description:
      'Lavadora con fallo de fabricación a los 3 meses. Empresa niega garantía.',
    priority: CasePriority.LOW,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.MERCANTIL,
    title: 'Incumplimiento contractual — Suministro mercancías',
    description:
      'Proveedor no entregó 40% del pedido. Se reclama cumplimiento y daños.',
    priority: CasePriority.HIGH,
    status: CaseStatus.ACTIVE,
  },
  {
    area: LegalArea.EXTRANJERIA,
    title: 'Solicitud renovación permiso de residencia',
    description:
      'Renovación de autorización de residencia y trabajo por arraigo laboral.',
    priority: CasePriority.URGENT,
    status: CaseStatus.ACTIVE,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seed
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed de LexAI v2...\n');

  // Limpiar datos existentes (orden inverso de dependencias)
  await prisma.postCallSummary.deleteMany();
  await prisma.voiceTranscript.deleteMany();
  await prisma.voiceSession.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.legalDocumentVersion.deleteMany();
  await prisma.legalDocument.deleteMany();
  await prisma.documentAnalysis.deleteMany();
  await prisma.document.deleteMany();
  await prisma.message.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.case.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.usageMeter.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // ── Usuarios demo ──────────────────────────────────────────────────────────

  const user1 = await prisma.user.create({
    data: {
      email: 'maria.garcia@demo.lexai.es',
      emailVerified: daysAgo(30),
      passwordHash: '$2b$10$demo.hash.maria.garcia.lexai',
      name: 'María García López',
      stripeCustomerId: 'cus_demo_maria_garcia',
      plan: UserPlan.PROFESSIONAL,
      locale: 'es-ES',
      encryptionKeyId: 'key_maria_001',
      lastLoginAt: daysAgo(1),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'carlos.ruiz@demo.lexai.es',
      emailVerified: daysAgo(15),
      passwordHash: '$2b$10$demo.hash.carlos.ruiz.lexai',
      name: 'Carlos Ruiz Martín',
      stripeCustomerId: 'cus_demo_carlos_ruiz',
      plan: UserPlan.STARTER,
      locale: 'es-ES',
      encryptionKeyId: 'key_carlos_001',
      lastLoginAt: daysAgo(3),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lexai.es',
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash('AdminLexAI2026!', 12),
      name: 'Administrador LexAI',
      role: UserRole.ADMIN,
      plan: UserPlan.ENTERPRISE,
      locale: 'es-ES',
      lastLoginAt: new Date(),
    },
  });

  console.log(`✓ Usuarios creados: ${user1.name}, ${user2.name}, ${adminUser.name} (admin)`);

  // ── Suscripciones Stripe ─────────────────────────────────────────────────────

  await prisma.subscription.create({
    data: {
      userId: user1.id,
      stripeSubscriptionId: 'sub_demo_maria_pro',
      stripePriceId: 'price_professional_monthly',
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: startOfMonth(),
      currentPeriodEnd: endOfMonth(),
      cancelAtPeriodEnd: false,
      metadata: { planName: 'Profesional Mensual', seats: 1 },
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user2.id,
      stripeSubscriptionId: 'sub_demo_carlos_starter',
      stripePriceId: 'price_starter_monthly',
      status: SubscriptionStatus.TRIALING,
      currentPeriodStart: daysAgo(5),
      currentPeriodEnd: daysFromNow(25),
      trialStart: daysAgo(5),
      trialEnd: daysFromNow(25),
      cancelAtPeriodEnd: false,
      metadata: { planName: 'Starter Mensual', trialDays: 30 },
    },
  });

  console.log('✓ Suscripciones Stripe creadas: 2');

  // ── Medidores de uso ─────────────────────────────────────────────────────────

  await prisma.usageMeter.create({
    data: {
      userId: user1.id,
      periodStart: startOfMonth(),
      periodEnd: endOfMonth(),
      consultationsUsed: 7,
      consultationsLimit: 50,
      documentsUsed: 12,
      documentsLimit: 100,
      voiceMinutesUsed: 45,
      voiceMinutesLimit: 300,
    },
  });

  await prisma.usageMeter.create({
    data: {
      userId: user2.id,
      periodStart: startOfMonth(),
      periodEnd: endOfMonth(),
      consultationsUsed: 3,
      consultationsLimit: 15,
      documentsUsed: 4,
      documentsLimit: 30,
      voiceMinutesUsed: 10,
      voiceMinutesLimit: 60,
    },
  });

  console.log('✓ Medidores de uso creados: 2');

  // ── Consentimientos RGPD ─────────────────────────────────────────────────────

  const consentTypes = [
    ConsentType.TERMS_OF_SERVICE,
    ConsentType.PRIVACY_POLICY,
    ConsentType.AI_PROCESSING,
    ConsentType.ANALYTICS_COOKIES,
  ];

  for (const user of [user1, user2]) {
    for (const type of consentTypes) {
      await prisma.consentRecord.create({
        data: {
          userId: user.id,
          type,
          granted: true,
          ip: '185.45.12.88',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LexAI/2.0',
          version: '2.1.0',
          grantedAt: daysAgo(30),
        },
      });
    }
  }

  console.log('✓ Registros de consentimiento RGPD: 8');

  // ── Expedientes (9 áreas legales para María, 3 para Carlos) ─────────────────

  const cases: Awaited<ReturnType<typeof prisma.case.create>>[] = [];

  for (const caseData of LEGAL_AREA_CASES) {
    const c = await prisma.case.create({
      data: {
        userId: user1.id,
        title: caseData.title,
        description: caseData.description,
        status: caseData.status,
        priority: caseData.priority,
        legalArea: caseData.area,
        reference: `EXP-${caseData.area.slice(0, 3)}-2026-${String(cases.length + 1).padStart(3, '0')}`,
      },
    });
    cases.push(c);
  }

  const carlosCases = await Promise.all([
    prisma.case.create({
      data: {
        userId: user2.id,
        title: 'Consulta inicial — Herencia y testamentaría',
        description: 'Asesoramiento sobre reparto de herencia entre tres herederos.',
        status: CaseStatus.DRAFT,
        priority: CasePriority.MEDIUM,
        legalArea: LegalArea.CIVIL,
        reference: 'EXP-CIV-2026-010',
      },
    }),
    prisma.case.create({
      data: {
        userId: user2.id,
        title: 'Reclamación salarial — Horas extra no pagadas',
        description: 'Reclamación de 1.800 € en concepto de horas extraordinarias.',
        status: CaseStatus.ACTIVE,
        priority: CasePriority.HIGH,
        legalArea: LegalArea.LABORAL,
        reference: 'EXP-LAB-2026-011',
      },
    }),
    prisma.case.create({
      data: {
        userId: user2.id,
        title: 'Multa aparcamiento — Zona azul',
        description: 'Recurso contra sanción de 90 € por estacionamiento indebido.',
        status: CaseStatus.CLOSED,
        priority: CasePriority.LOW,
        legalArea: LegalArea.TRAFICO,
        reference: 'EXP-TRA-2026-012',
        closedAt: daysAgo(10),
      },
    }),
  ]);

  cases.push(...carlosCases);

  console.log(`✓ Expedientes creados: ${cases.length} (9 áreas legales cubiertas)`);

  // ── Consultas y mensajes ─────────────────────────────────────────────────────

  const laboralCase = cases.find((c) => c.legalArea === LegalArea.LABORAL && c.userId === user1.id)!;
  const penalCase = cases.find((c) => c.legalArea === LegalArea.PENAL)!;
  const extranjeriaCase = cases.find((c) => c.legalArea === LegalArea.EXTRANJERIA)!;

  const consultation1 = await prisma.consultation.create({
    data: {
      caseId: laboralCase.id,
      agentId: 'agent_laboral_v2',
      status: ConsultationStatus.COMPLETED,
      topic: 'Análisis de despido improcedente',
      summary:
        'Se confirma improcedencia del despido. Recomendado presentar papeleta de conciliación en 20 días hábiles.',
      startedAt: daysAgo(5),
      endedAt: daysAgo(5),
      messages: {
        create: [
          {
            role: MessageRole.USER,
            content:
              'Me han despedido sin previo aviso después de 8 años en la empresa. No me han entregado carta de despido. ¿Qué opciones tengo?',
            metadata: { channel: 'web', language: 'es' },
            tokenCount: 42,
          },
          {
            role: MessageRole.ASSISTANT,
            content:
              'Buenos días, María. Por lo que describes, el despido podría ser **improcedente** por dos motivos principales:\n\n1. **Falta de carta de despido**: El art. 55 ET exige comunicación escrita con causa.\n2. **Despido nulo o improcedente**: Sin causa justificada acreditada, corresponde readmisión o indemnización de 33 días por año trabajado (máx. 24 mensualidades).\n\n**Plazo**: Dispone de 20 días hábiles para presentar papeleta de conciliación ante el SMAC.\n\n¿Dispone del finiquito o de alguna comunicación escrita de la empresa?',
            metadata: { model: 'lexai-agent-laboral', citations: ['Art. 55 ET', 'Art. 56 ET'] },
            tokenCount: 186,
          },
          {
            role: MessageRole.USER,
            content:
              'Solo tengo un email del jefe de RRHH diciendo que "ya no encajaba en el equipo". No hay finiquito.',
            tokenCount: 28,
          },
          {
            role: MessageRole.ASSISTANT,
            content:
              'Ese email puede servir como prueba de la comunicación del despido, aunque sea insuficiente formalmente. Le recomiendo:\n\n1. Solicitar por burofax la carta de despido y finiquito.\n2. Presentar papeleta de conciliación ante el SMAC de Madrid.\n3. Calcular indemnización: 8 años × 33 días = 264 días de salario.\n\n¿Desea que generemos la carta de despido improcedente y la papeleta de conciliación?',
            metadata: { suggestedActions: ['generate_burofax', 'generate_conciliacion'] },
            tokenCount: 142,
          },
        ],
      },
    },
  });

  const consultation2 = await prisma.consultation.create({
    data: {
      caseId: penalCase.id,
      agentId: 'agent_penal_v2',
      status: ConsultationStatus.IN_PROGRESS,
      topic: 'Orientación sobre denuncia por estafa',
      startedAt: daysAgo(2),
      messages: {
        create: [
          {
            role: MessageRole.USER,
            content:
              'Compré un portátil por 3.200 € en un marketplace y nunca llegó. El vendedor desapareció. ¿Puedo denunciar?',
            tokenCount: 35,
          },
          {
            role: MessageRole.ASSISTANT,
            content:
              'Sí, tiene fundamento para interponer **denuncia por estafa** (art. 248-250 CP). Deberá acudir a la Comisaría o presentar denuncia online con:\n\n- Capturas de la compra y conversaciones\n- Justificante de pago (transferencia Bizum/tarjeta)\n- Datos del vendedor si los tiene\n\nEl delito de estafa requiere engaño bastante y perjuicio económico. Con 3.200 € supera el umbral de procedimiento abreviado.\n\n¿Ha intentado reclamar al marketplace o a su entidad bancaria (chargeback)?',
            metadata: { model: 'lexai-agent-penal', severity: 'media' },
            tokenCount: 168,
          },
        ],
      },
    },
  });

  const consultation3 = await prisma.consultation.create({
    data: {
      caseId: extranjeriaCase.id,
      agentId: 'agent_extranjeria_v2',
      status: ConsultationStatus.AWAITING_USER,
      topic: 'Renovación permiso de residencia por arraigo',
      startedAt: daysAgo(1),
      messages: {
        create: [
          {
            role: MessageRole.SYSTEM,
            content: 'Consulta iniciada. Agente de extranjería asignado.',
            metadata: { event: 'consultation_started' },
          },
          {
            role: MessageRole.USER,
            content:
              'Mi permiso de residencia vence en 45 días. Llevo 3 años trabajando con contrato indefinido. ¿Puedo renovar por arraigo laboral?',
            tokenCount: 38,
          },
          {
            role: MessageRole.ASSISTANT,
            content:
              'Con 3 años de contrato indefinido y cotización continuada, cumple los requisitos del **arraigo laboral** (art. 124 RD 557/2011). Necesitará:\n\n- Pasaporte vigente\n- Empadronamiento continuado\n- Contrato de trabajo y vida laboral\n- Seguro médico o autorización de trabajo\n- Tasa 790-052 (10,76 €)\n\n**Urgente**: El plazo de presentación es de 60 días antes del vencimiento. Le quedan 45 días.\n\n¿Desea que preparemos el escrito de solicitud?',
            metadata: { urgency: 'alta', deadlineDays: 45 },
            tokenCount: 175,
          },
        ],
      },
    },
  });

  // Consulta de Carlos
  await prisma.consultation.create({
    data: {
      caseId: carlosCases[1].id,
      agentId: 'agent_laboral_v2',
      status: ConsultationStatus.COMPLETED,
      topic: 'Reclamación horas extra',
      summary: 'Viable reclamación extrajudicial previa al proceso judicial.',
      startedAt: daysAgo(7),
      endedAt: daysAgo(7),
      messages: {
        create: [
          {
            role: MessageRole.USER,
            content: 'Mi empresa no me paga las horas extra del último año. Tengo registros de fichaje.',
            tokenCount: 22,
          },
          {
            role: MessageRole.ASSISTANT,
            content:
              'Con registros de fichaje tiene prueba documental sólida. Le recomiendo reclamación extrajudicial previa (requerimiento de pago) antes de demandar. Plazo de prescripción: 1 año desde cada devengo.',
            tokenCount: 58,
          },
        ],
      },
    },
  });

  console.log('✓ Consultas creadas: 4 (con 11 mensajes)');

  // ── Documentos y análisis ────────────────────────────────────────────────────

  const doc1 = await prisma.document.create({
    data: {
      caseId: laboralCase.id,
      filename: 'email_despido_rrhh.pdf',
      mimeType: 'application/pdf',
      r2Key: `cases/${laboralCase.id}/email_despido_rrhh.pdf`,
      encrypted: true,
      size: 245_760,
      checksum: 'sha256:demo_checksum_001',
      analysis: {
        create: {
          riskScore: 7.5,
          semaphore: DocumentSemaphore.YELLOW,
          summary:
            'Email de RRHH sin formalidad legal suficiente. Ausencia de causa detallada del despido. Recomendable solicitar carta formal.',
          clauses: [
            {
              id: 'cl_001',
              type: 'comunicacion_despido',
              text: 'Ya no encajas en el equipo y hemos decidido prescindir de tus servicios.',
              risk: 'alto',
              article: 'Art. 55.1 ET',
              recommendation: 'Solicitar carta de despido con causa detallada',
            },
            {
              id: 'cl_002',
              type: 'falta_finiquito',
              text: null,
              risk: 'medio',
              article: 'Art. 56.1 ET',
              recommendation: 'Requerir finiquito y documento de liquidación',
            },
          ],
          metadata: { pages: 2, ocrConfidence: 0.97 },
        },
      },
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      caseId: laboralCase.id,
      filename: 'contrato_trabajo_indefinido.pdf',
      mimeType: 'application/pdf',
      r2Key: `cases/${laboralCase.id}/contrato_trabajo_indefinido.pdf`,
      encrypted: true,
      size: 512_000,
      analysis: {
        create: {
          riskScore: 2.0,
          semaphore: DocumentSemaphore.GREEN,
          summary:
            'Contrato indefinido conforme a legislación vigente. Cláusulas estándar sin irregularidades detectadas.',
          clauses: [
            {
              id: 'cl_003',
              type: 'duracion',
              text: 'Contrato de trabajo indefinido a jornada completa',
              risk: 'bajo',
            },
            {
              id: 'cl_004',
              type: 'salario',
              text: 'Salario bruto anual: 28.500 € en 14 pagas',
              risk: 'bajo',
            },
          ],
        },
      },
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      caseId: cases.find((c) => c.legalArea === LegalArea.MERCANTIL)!.id,
      filename: 'contrato_suministro_2025.pdf',
      mimeType: 'application/pdf',
      r2Key: `cases/${cases.find((c) => c.legalArea === LegalArea.MERCANTIL)!.id}/contrato_suministro_2025.pdf`,
      encrypted: true,
      size: 1_048_576,
      analysis: {
        create: {
          riskScore: 8.2,
          semaphore: DocumentSemaphore.RED,
          summary:
            'Cláusula penal desproporcionada y plazo de entrega ambiguo. Riesgo alto de impugnación parcial.',
          clauses: [
            {
              id: 'cl_005',
              type: 'penalizacion',
              text: 'Penalización del 30% del valor del contrato por cada día de retraso',
              risk: 'critico',
              article: 'Art. 1152 CC',
              recommendation: 'Negociar reducción al 0,5% diario (máximo recomendado)',
            },
            {
              id: 'cl_006',
              type: 'plazo_entrega',
              text: 'Entrega "a la mayor brevedad posible"',
              risk: 'alto',
              recommendation: 'Definir plazo concreto (ej. 15 días hábiles)',
            },
          ],
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      caseId: penalCase.id,
      filename: 'capturas_marketplace_estafa.zip',
      mimeType: 'application/zip',
      r2Key: `cases/${penalCase.id}/capturas_marketplace_estafa.zip`,
      encrypted: true,
      size: 3_456_789,
    },
  });

  console.log(`✓ Documentos creados: 4 (3 con análisis, doc laboral: ${doc1.id.slice(0, 8)}...)`);

  // ── Documentos legales generados ───────────────────────────────────────────────

  const legalDoc1 = await prisma.legalDocument.create({
    data: {
      caseId: laboralCase.id,
      type: LegalDocumentType.CARTA_DESPIDO,
      title: 'Carta de despido improcedente — Requerimiento',
      status: 'final',
      versions: {
        create: [
          {
            version: 1,
            htmlContent: `<article>
<h1>REQUERIMIENTO DE CARTA DE DESPIDO</h1>
<p>D./Dña. <strong>María García López</strong>, con DNI 12345678A, ante el SMAC de Madrid,</p>
<p><strong>EXPONE:</strong> Que fue despedida el día 10 de junio de 2026 sin recibir carta de despido conforme al Art. 55 del Estatuto de los Trabajadores.</p>
<p><strong>SOLICITA:</strong> Se declare la improcedencia del despido y se condene a la empresa al abono de la indemnización correspondiente (264 días de salario).</p>
</article>`,
            metadata: { generatedBy: 'lexai-agent-laboral', templateVersion: '2.1' },
          },
          {
            version: 2,
            htmlContent: `<article>
<h1>REQUERIMIENTO DE CARTA DE DESPIDO (REVISADO)</h1>
<p>D./Dña. <strong>María García López</strong>, con DNI 12345678A,</p>
<p><strong>EXPONE:</strong> Despido verbal comunicado por email de fecha 10/06/2026, sin causa justificada ni formalidad legal.</p>
<p><strong>SOLICITA:</strong> Improcedencia del despido. Indemnización: 33 días/año × 8 años = 264 días. Readmisión subsidiaria.</p>
<p><em>Documento revisado tras análisis de prueba documental.</em></p>
</article>`,
            metadata: { generatedBy: 'lexai-agent-laboral', revisionReason: 'incorporacion_prueba_email' },
          },
        ],
      },
    },
  });

  await prisma.legalDocument.create({
    data: {
      caseId: cases.find((c) => c.legalArea === LegalArea.TRAFICO && c.userId === user1.id)!.id,
      type: LegalDocumentType.RECURSO_MULTA,
      title: 'Recurso de alzada — Multa exceso velocidad A-6',
      status: 'draft',
      versions: {
        create: {
          version: 1,
          htmlContent: `<article>
<h1>RECURSO DE ALZADA</h1>
<p>Ante la Jefatura Provincial de Tráfico de Madrid,</p>
<p><strong>RECURRE:</strong> La sanción impuesta por exceso de velocidad en A-6, pk 12, alegando error en señalización del radar fijo.</p>
</article>`,
        },
      },
    },
  });

  await prisma.legalDocument.create({
    data: {
      caseId: extranjeriaCase.id,
      type: LegalDocumentType.SOLICITUD_NACIONALIDAD,
      title: 'Solicitud renovación autorización de residencia',
      status: 'draft',
      versions: {
        create: {
          version: 1,
          htmlContent: `<article>
<h1>SOLICITUD DE RENOVACIÓN DE AUTORIZACIÓN DE RESIDENCIA Y TRABAJO</h1>
<p>Arraigo laboral — Art. 124 del Reglamento de Extranjería</p>
<p>Se acompaña: contrato indefinido, vida laboral, empadronamiento y seguro médico.</p>
</article>`,
        },
      },
    },
  });

  console.log(`✓ Documentos legales generados: 3 (carta despido v2: ${legalDoc1.id.slice(0, 8)}...)`);

  // ── Plazos (Deadlines) ───────────────────────────────────────────────────────

  const deadlines = await Promise.all([
    prisma.deadline.create({
      data: {
        caseId: laboralCase.id,
        title: 'Presentar papeleta de conciliación SMAC',
        description: 'Plazo de 20 días hábiles desde el despido (art. 63 ET)',
        dueDate: daysFromNow(12),
        urgency: DeadlineUrgency.CRITICAL,
        status: DeadlineStatus.PENDING,
        reminderAt: daysFromNow(10),
      },
    }),
    prisma.deadline.create({
      data: {
        caseId: extranjeriaCase.id,
        title: 'Renovación permiso de residencia',
        description: 'Presentar solicitud 60 días antes del vencimiento',
        dueDate: daysFromNow(45),
        urgency: DeadlineUrgency.HIGH,
        status: DeadlineStatus.PENDING,
        reminderAt: daysFromNow(40),
      },
    }),
    prisma.deadline.create({
      data: {
        caseId: penalCase.id,
        title: 'Presentar denuncia en comisaría',
        dueDate: daysFromNow(5),
        urgency: DeadlineUrgency.MEDIUM,
        status: DeadlineStatus.PENDING,
      },
    }),
    prisma.deadline.create({
      data: {
        caseId: cases.find((c) => c.legalArea === LegalArea.FISCAL)!.id,
        title: 'Recurso de reposición AEAT',
        description: 'Plazo de 1 mes desde notificación de liquidación',
        dueDate: daysFromNow(18),
        urgency: DeadlineUrgency.HIGH,
        status: DeadlineStatus.PENDING,
      },
    }),
    prisma.deadline.create({
      data: {
        caseId: carlosCases[2].id,
        title: 'Pago multa aparcamiento con descuento',
        dueDate: daysAgo(15),
        urgency: DeadlineUrgency.LOW,
        status: DeadlineStatus.COMPLETED,
        completedAt: daysAgo(12),
      },
    }),
  ]);

  console.log(`✓ Plazos creados: ${deadlines.length}`);

  // ── Eventos de timeline ──────────────────────────────────────────────────────

  const timelineCount = await seedTimelineEvents(cases, laboralCase, consultation1.id);

  console.log(`✓ Eventos de timeline creados: ${timelineCount}`);

  // ── Sesiones de voz ────────────────────────────────────────────────────────────

  const voiceSession = await prisma.voiceSession.create({
    data: {
      caseId: laboralCase.id,
      livekitRoomId: 'room_demo_laboral_001',
      twilioCallSid: 'CA_demo_twilio_laboral_001',
      status: VoiceSessionStatus.COMPLETED,
      duration: 1247,
      startedAt: daysAgo(3),
      endedAt: daysAgo(3),
      metadata: { agent: 'lexai-voice-laboral', quality: 'hd' },
      transcript: {
        create: {
          segments: [
            { speaker: 'user', text: 'Hola, necesito hablar sobre mi despido.', startMs: 0, endMs: 4200 },
            { speaker: 'assistant', text: 'Buenos días María. He revisado su expediente laboral. ¿Tiene el email de RRHH que mencionó?', startMs: 4500, endMs: 11200 },
            { speaker: 'user', text: 'Sí, lo subí ayer a la plataforma.', startMs: 11500, endMs: 14800 },
            { speaker: 'assistant', text: 'Perfecto. El análisis indica riesgo medio-alto de improcedencia. Le recomiendo actuar en los próximos 12 días.', startMs: 15100, endMs: 23400 },
            { speaker: 'user', text: '¿Pueden generar la papeleta de conciliación?', startMs: 23800, endMs: 27100 },
            { speaker: 'assistant', text: 'Por supuesto. La tendrá lista en su expediente en unos minutos.', startMs: 27400, endMs: 31200 },
          ],
          language: 'es',
        },
      },
      postCallSummary: {
        create: {
          summary:
            'Consulta telefónica sobre despido improcedente. Usuario confirmó subida de prueba documental (email RRHH). Agente recomendó papeleta de conciliación con plazo de 12 días restantes. Usuario solicitó generación automática del escrito.',
          actions: [
            { type: 'generate_document', documentType: 'SOLICITUD_CONCILIACION', status: 'pending' },
            { type: 'create_deadline', title: 'Seguimiento papeleta SMAC', dueInDays: 12 },
            { type: 'notify_user', channel: 'email', template: 'post_call_summary' },
          ],
        },
      },
    },
  });

  await prisma.voiceSession.create({
    data: {
      caseId: extranjeriaCase.id,
      livekitRoomId: 'room_demo_extranjeria_001',
      status: VoiceSessionStatus.SCHEDULED,
      metadata: { scheduledFor: daysFromNow(2).toISOString() },
    },
  });

  console.log(`✓ Sesiones de voz creadas: 2 (completada: ${voiceSession.id.slice(0, 8)}...)`);

  // ── Auditoría ────────────────────────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      {
        userId: user1.id,
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress: '185.45.12.88',
        userAgent: 'LexAI Web/2.0',
      },
      {
        userId: user1.id,
        action: AuditAction.CREATE,
        resource: 'case',
        resourceId: laboralCase.id,
        metadata: { legalArea: 'LABORAL' },
      },
      {
        userId: user1.id,
        action: AuditAction.CREATE,
        resource: 'consultation',
        resourceId: consultation1.id,
      },
      {
        userId: user1.id,
        action: AuditAction.CREATE,
        resource: 'document',
        metadata: { filename: 'email_despido_rrhh.pdf' },
      },
      {
        userId: user1.id,
        action: AuditAction.CONSENT_GRANTED,
        resource: 'consent',
        metadata: { type: 'AI_PROCESSING' },
      },
      {
        userId: user2.id,
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress: '90.23.45.67',
      },
      {
        userId: user2.id,
        action: AuditAction.CREATE,
        resource: 'case',
        resourceId: carlosCases[0].id,
      },
    ],
  });

  console.log('✓ Registros de auditoría: 7');

  // ── Resumen final ────────────────────────────────────────────────────────────

  const counts = {
    users: await prisma.user.count(),
    subscriptions: await prisma.subscription.count(),
    usageMeters: await prisma.usageMeter.count(),
    cases: await prisma.case.count(),
    consultations: await prisma.consultation.count(),
    messages: await prisma.message.count(),
    documents: await prisma.document.count(),
    documentAnalyses: await prisma.documentAnalysis.count(),
    legalDocuments: await prisma.legalDocument.count(),
    legalDocumentVersions: await prisma.legalDocumentVersion.count(),
    deadlines: await prisma.deadline.count(),
    timelineEvents: await prisma.timelineEvent.count(),
    voiceSessions: await prisma.voiceSession.count(),
    voiceTranscripts: await prisma.voiceTranscript.count(),
    postCallSummaries: await prisma.postCallSummary.count(),
    auditLogs: await prisma.auditLog.count(),
    consentRecords: await prisma.consentRecord.count(),
  };

  console.log('\n═══════════════════════════════════════════');
  console.log('  Seed completado — LexAI v2');
  console.log('═══════════════════════════════════════════');
  console.log(JSON.stringify(counts, null, 2));
}

async function seedTimelineEvents(
  cases: Array<{ id: string; title: string; legalArea: LegalArea }>,
  laboralCase: { id: string },
  consultationId: string,
): Promise<number> {
  let count = 0;

  for (const c of cases.slice(0, 9)) {
    await prisma.timelineEvent.create({
      data: {
        caseId: c.id,
        type: TimelineEventType.CASE_CREATED,
        title: 'Expediente creado',
        description: `Se ha abierto el expediente "${c.title}" en el área ${c.legalArea}.`,
        occurredAt: daysAgo(14),
      },
    });
    count++;
  }

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.CONSULTATION_STARTED,
      title: 'Consulta iniciada',
      description: 'Consulta con agente laboral sobre despido improcedente.',
      metadata: { consultationId },
      occurredAt: daysAgo(5),
    },
  });
  count++;

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.DOCUMENT_UPLOADED,
      title: 'Documento subido',
      description: 'Email de RRHH (email_despido_rrhh.pdf) añadido al expediente.',
      occurredAt: daysAgo(4),
    },
  });
  count++;

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.DOCUMENT_ANALYZED,
      title: 'Análisis completado',
      description: 'Análisis de riesgo: 7.5/10 — Semáforo amarillo.',
      metadata: { riskScore: 7.5, semaphore: 'YELLOW' },
      occurredAt: daysAgo(4),
    },
  });
  count++;

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.LEGAL_DOCUMENT_GENERATED,
      title: 'Documento legal generado',
      description: 'Carta de despido improcedente — versión 2.',
      occurredAt: daysAgo(3),
    },
  });
  count++;

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.VOICE_SESSION_ENDED,
      title: 'Llamada de voz finalizada',
      description: 'Sesión de voz de 20 min 47 s. Resumen y acciones generados.',
      metadata: { duration: 1247 },
      occurredAt: daysAgo(3),
    },
  });
  count++;

  await prisma.timelineEvent.create({
    data: {
      caseId: laboralCase.id,
      type: TimelineEventType.DEADLINE_CREATED,
      title: 'Plazo registrado',
      description: 'Papeleta de conciliación SMAC — vence en 12 días.',
      occurredAt: daysAgo(2),
    },
  });
  count++;

  return count;
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });