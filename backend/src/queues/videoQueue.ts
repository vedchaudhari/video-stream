import { Queue } from "bullmq";
import { redisConnection } from "../config/bullmq.js";

export const videoQueue = new Queue("video-processing", {
    connection: redisConnection,
});