import { Pool } from 'pg';

declare global {
  var _postgresPool: Pool | undefined;
}

const pool = globalThis._postgresPool ||= new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 6543,
  ssl: { rejectUnauthorized: false }
});

export default pool;