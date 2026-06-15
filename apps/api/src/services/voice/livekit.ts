export interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  url: string;
}

export interface LiveKitTokenParams {
  roomName: string;
  participantIdentity: string;
  participantName?: string;
  ttlSeconds?: number;
}

export function isLiveKitConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env['LIVEKIT_API_KEY'] &&
      env['LIVEKIT_API_SECRET'] &&
      env['LIVEKIT_URL'] &&
      env['LIVEKIT_API_KEY'] !== 'your-livekit-api-key',
  );
}

export function getLiveKitConfig(env: NodeJS.ProcessEnv = process.env): LiveKitConfig | null {
  if (!isLiveKitConfigured(env)) {
    return null;
  }

  const apiKey = env['LIVEKIT_API_KEY'];
  const apiSecret = env['LIVEKIT_API_SECRET'];
  const url = env['LIVEKIT_URL'];
  if (!apiKey || !apiSecret || !url) {
    return null;
  }

  return { apiKey, apiSecret, url };
}

/**
 * Genera JWT de acceso a sala LiveKit.
 * Requiere LIVEKIT_API_KEY, LIVEKIT_API_SECRET y LIVEKIT_URL en .env.
 */
export async function createLiveKitToken(params: LiveKitTokenParams): Promise<string> {
  const config = getLiveKitConfig();
  if (!config) {
    throw new Error(
      'LiveKit no configurado. Establezca LIVEKIT_API_KEY, LIVEKIT_API_SECRET y LIVEKIT_URL.',
    );
  }

  const { AccessToken } = await import('livekit-server-sdk');

  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity: params.participantIdentity,
    ...(params.participantName ? { name: params.participantName } : {}),
    ttl: params.ttlSeconds ?? 3600,
  });

  token.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return token.toJwt();
}

export function buildRoomName(caseId: string, sessionId: string): string {
  return `lexai-${caseId}-${sessionId}`;
}