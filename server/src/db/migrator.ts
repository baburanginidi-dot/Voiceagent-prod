import fs from 'node:fs';
import path from 'node:path';
import { db } from './client.js';

const MIGRATIONS_TABLE = `CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

const resolveMigrationsDir = () => {
  const cwd = process.cwd();
  const direct = path.resolve(cwd, 'migrations');
  if (fs.existsSync(direct)) {
    return direct;
  }
  return path.resolve(cwd, 'server', 'migrations');
};

const migrationsDir = resolveMigrationsDir();

export const runMigrations = () => {
  db.exec(MIGRATIONS_TABLE);

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const selectStmt = db.prepare('SELECT 1 FROM schema_migrations WHERE id = ?');
  const insertStmt = db.prepare('INSERT INTO schema_migrations(id) VALUES (?)');

  for (const file of files) {
    const alreadyApplied = selectStmt.get(file);
    if (alreadyApplied) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      insertStmt.run(file);
      db.exec('COMMIT');
      console.info(`[migrations] applied ${file}`);
    } catch (error) {
      db.exec('ROLLBACK');
      console.error(`[migrations] failed to apply ${file}`, error);
      throw error;
    }
  }
};
