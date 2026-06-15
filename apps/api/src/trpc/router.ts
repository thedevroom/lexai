import { createRouter } from './trpc.js';
import { adminRouter } from './routers/admin.js';
import { authRouter } from './routers/auth.js';
import { casesRouter } from './routers/cases.js';
import { complianceRouter } from './routers/compliance.js';
import { consultationsRouter } from './routers/consultations.js';
import { documentsRouter } from './routers/documents.js';
import { voiceRouter } from './routers/voice.js';

export const appRouter = createRouter({
  admin: adminRouter,
  auth: authRouter,
  cases: casesRouter,
  compliance: complianceRouter,
  consultations: consultationsRouter,
  documents: documentsRouter,
  voice: voiceRouter,
});

export type AppRouter = typeof appRouter;