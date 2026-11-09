import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ca = process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  : fs.readFileSync(path.join(process.cwd(), "certs", "ca.pem"), "utf8");

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca,
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
