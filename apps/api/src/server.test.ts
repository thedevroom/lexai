import { describe, expect, it } from 'vitest';
import { createServer } from './server.js';

describe('createServer', () => {
  it('returns health check payload', async () => {
    const server = await createServer();

    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body) as {
      status: string;
      service: string;
      version: string;
      timestamp: string;
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('lexai-api');
    expect(body.version).toBe('0.1.0');
    expect(body.timestamp).toBeTruthy();

    await server.close();
  });
});