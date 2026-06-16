/**
 * Server-only entry to the compiled API package (dist).
 * Avoids Next.js resolving TypeScript source with .js import specifiers.
 */
export { appRouter } from '../../../api/dist/trpc/router.js';
export { createFetchContext } from '../../../api/dist/trpc/context.js';