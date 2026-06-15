import { mapPlainTextApiError } from './safe-json';

/** tRPC HTTP batch wire error shape returned to the client. */
export function buildTrpcBatchError(message: string, httpStatus = 502): string {
  return JSON.stringify([
    {
      error: {
        json: {
          message,
          code: -32050,
          data: {
            code: 'API_UNAVAILABLE',
            httpStatus,
          },
        },
      },
    },
  ]);
}

export function buildTrpcErrorFromRawBody(raw: string, httpStatus = 502): string {
  return buildTrpcBatchError(mapPlainTextApiError(raw), httpStatus);
}