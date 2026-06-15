/**
 * Smoke test: auth.register against running API + PostgreSQL.
 */
import superjson from 'superjson';

const API = process.env.API_URL ?? 'http://localhost:4000';
const email = `test-${Date.now()}@lexai.local`;

const input = {
  email,
  password: 'TestPass123!',
  name: 'Test User',
};

const res = await fetch(`${API}/trpc/auth.register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(superjson.serialize(input)),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  console.error('Non-JSON response:', text.slice(0, 500));
  process.exit(1);
}

if (!res.ok || json.error) {
  console.error('Register failed:', JSON.stringify(json, null, 2));
  process.exit(1);
}

const raw = json.result?.data;
const result = raw?.json ?? superjson.deserialize(raw ?? json);
if (!result?.user?.id || !result?.token) {
  console.error('Unexpected payload:', JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log('OK register:', result.user.email, result.user.id);