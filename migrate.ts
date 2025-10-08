import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql);

async function main() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();