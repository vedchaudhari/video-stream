import "./env.js";
import http from "http";
import app from "./app.js";
import pool from "./config/postgres.js";
import connectMongodb from "./config/mongo.js";
import redis from "./config/redis.js";
import { setupSocket } from "./socket.js";

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await pool.connect();
        await connectMongodb();
        await redis.ping();

        const server = http.createServer(app);

        setupSocket(server);

        server.listen(PORT, () => {
            console.log("Server running on port", PORT);
        })
    } catch (error) {
        console.error("Error starting server", error)
        process.exit(1);
    }
}

startServer();