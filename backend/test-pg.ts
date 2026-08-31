import { PGlite } from '@electric-sql/pglite';

async function test() {
  console.log('Testing PGlite in Node.js...');
  const db = new PGlite('./prisma/pgdata');
  const res = await db.query('SELECT version();');
  console.log('PostgreSQL Version:', res.rows[0]);
  await db.close();
}

test().catch(console.error);
