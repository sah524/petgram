import { drizzle } from "drizzle-orm/mysql2";
import { pool } from "../database";
export { pool };
export const db = drizzle({ client: pool });
