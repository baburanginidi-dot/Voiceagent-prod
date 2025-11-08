import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';

const resolveDatabasePath = (): string => {
  const url = env.databaseUrl;
  if (url.startsWith('file:')) {
    const relativePath = url.replace('file:', '');
    return path.resolve(process.cwd(), relativePath);
  }

  if (url === ':memory:') {
    return url;
  }

  throw new Error(
    `Unsupported DATABASE_URL. Only SQLite file paths (file:./path/db.sqlite) or :memory: are supported for now. Received ${url}`,
  );
};

export const databasePath = resolveDatabasePath();

if (databasePath !== ':memory:') {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

export const db = new Database(databasePath);
if (databasePath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}
