export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export function isTwilioConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const sid = env['TWILIO_ACCOUNT_SID'];
  return Boolean(
    sid &&
      env['TWILIO_AUTH_TOKEN'] &&
      env['TWILIO_PHONE_NUMBER'] &&
      sid.startsWith('AC') &&
      sid !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  );
}

export function getTwilioConfig(env: NodeJS.ProcessEnv = process.env): TwilioConfig | null {
  if (!isTwilioConfigured(env)) {
    return null;
  }

  const accountSid = env['TWILIO_ACCOUNT_SID'];
  const authToken = env['TWILIO_AUTH_TOKEN'];
  const phoneNumber = env['TWILIO_PHONE_NUMBER'];
  if (!accountSid || !authToken || !phoneNumber) {
    return null;
  }

  return { accountSid, authToken, phoneNumber };
}

/**
 * TwiML básico para enrutar llamada entrante a sala LiveKit (SIP bridge — fase posterior).
 * Por ahora devuelve mensaje de bienvenida mientras se configura el número.
 */
export function buildInboundCallTwiml(greeting: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">${escapeXml(greeting)}</Say>
  <Pause length="1"/>
  <Say language="es-ES">Gracias por contactar con LexAI. Un agente jurídico le atenderá en breve.</Say>
</Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}