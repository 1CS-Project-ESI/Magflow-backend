import { configDotenv } from "dotenv";
import pg from "pg";
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = 'postgresql://magflow_owner:5Eq8jApoIJid@ep-long-leaf-a5xlkcbr-pooler.us-east-2.aws.neon.tech/magflow?sslmode=require';

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction
});

export {pool}





