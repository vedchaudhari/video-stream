import { type ConnectionOptions } from "bullmq";

export const redisConnection: ConnectionOptions = {
    host: "localhost",
    port: 6370,
    password: "redispassword",
};