import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

pool.on("connect", () => {
    console.log("📦 Postgres pool connected");
})

pool.on("error", (err) => {
    console.error("Postgres Error ------- ", err)
})

export default pool;