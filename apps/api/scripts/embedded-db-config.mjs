import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Matches DATABASE_URL in .env (docker-compose / local embedded). */
export const EMBEDDED_DB = {
  user: 'lexai',
  password: 'lexai_dev_password',
  port: 5432,
  database: 'lexai',
  databaseDir: path.join(__dirname, '..', '.embedded-db'),
  connectionString: 'postgres://lexai:lexai_dev_password@localhost:5432/lexai',
};