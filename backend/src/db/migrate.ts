import pool from "../config/postgres.js";
import fs from "fs";
import path from "path";

const migrate = async() => {
    const dir = path.join(import.meta.dirname, "migrations");
    const files = fs.readdirSync(dir).sort();

    for(const file of files){
        const sql = fs.readFileSync(path.join(dir,file), "utf-8");
        await pool.query(sql);
        console.log("Ran migration", file);
    }
    await pool.end();
}