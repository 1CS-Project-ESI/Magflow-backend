import { configDotenv } from "dotenv";
import pg from "pg";
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = 'postgresql://postgres:abcd@localhost:5000/magflow';

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction
});

export {pool}





