/**
 * Safe JSON parsing for API responses that may return plain text
 * (Vercel deploy errors, HTML pages, etc.).
 */

export interface SafeParseResult<T> {
  ok: true;
  data: T;
}

export interface SafeParseError {
  ok: false;
  raw: string;
  message: string;
}

export type SafeParseResponse<T> = SafeParseResult<T> | SafeParseError;

/** Detect Vercel / infra error pages returned as plain text. */
export function mapPlainTextApiError(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('the deployment') ||
    lower.startsWith('the deploy') ||
    lower.includes('deployment has failed')
  ) {
    return 'The API service is temporarily unavailable. Please try again in a few minutes.';
  }
  if (lower.includes('bad gateway') || lower.includes('502')) {
    return 'Could not connect to the server. Check your connection or try again later.';
  }
  if (lower.includes('service unavailable') || lower.includes('503')) {
    return 'The service is under maintenance. Please try again soon.';
  }
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'Unexpected server response. The backend may not be configured.';
  }
  if (trimmed.length === 0) {
    return 'The server returned an empty response.';
  }

  const preview = trimmed.slice(0, 120).replace(/\s+/g, ' ');
  return `Invalid server response: ${preview}${trimmed.length > 120 ? '…' : ''}`;
}

export function safeJsonParse<T>(text: string): SafeParseResponse<T> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, raw: text, message: mapPlainTextApiError(text) };
  }

  const first = trimmed[0];
  if (first !== '{' && first !== '[') {
    return { ok: false, raw: text, message: mapPlainTextApiError(text) };
  }

  try {
    return { ok: true, data: JSON.parse(trimmed) as T };
  } catch {
    return { ok: false, raw: text, message: mapPlainTextApiError(text) };
  }
}

export function looksLikeJsonResponse(contentType: string | null, text: string): boolean {
  if (contentType?.includes('application/json')) return true;
  const t = text.trimStart();
  return t.startsWith('{') || t.startsWith('[');
}