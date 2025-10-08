import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql);

async function main() {
  try {
    console.log("Resetting database...");
    await db.execute(`DROP TABLE IF EXISTS budgets CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS categories CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS expenses CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS families CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS incomes CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS recurring_transactions CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS drizzle.__drizzle_migrations CASCADE`);
    console.log("Database reset successfully!");
  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
}

main();
