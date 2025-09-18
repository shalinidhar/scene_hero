import { db } from '../backend/db';
import dotenv from 'dotenv';
import path from 'path';

import { parse } from 'pg-connection-string';
import 'dotenv/config';

async function testConnection(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); 
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  console.log("Parsed DB URL:", parse(process.env.DATABASE_URL || ''));

  console.log("Type of DATABASE_URL:", typeof process.env.DATABASE_URL);
  console.log("Raw value of DATABASE_URL:", JSON.stringify(process.env.DATABASE_URL));


  try {
    const res = await db.query<NowQueryResult>('SELECT NOW()');
    console.log('Connected! Current time from DB:', res.rows[0].now);
  } catch (err: any) {
    console.error('Connection failed:', err.message);
  } finally {
    await db.end(); 
  }
}

testConnection();

