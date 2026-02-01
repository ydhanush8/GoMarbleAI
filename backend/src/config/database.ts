import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in environment variables');
}

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);

/**
 * Prisma Client Instance
 * For Prisma 7, we use the driver adapter for direct connections
 */
const prisma = new PrismaClient({ adapter });

export default prisma;
