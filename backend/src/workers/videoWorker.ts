import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/bullmq.js";

const videoWorker = new Worker(
    "video-processing",
    async (job: Job) => {
        console.log("Processing video :", job.data);
        //transcoding logic
    },
    { connection: redisConnection }
);

videoWorker.on("completed", (job) => {
    console.log("Job completed:", job.id);
});

videoWorker.on("failed", (job, err) => {
    console.error("Job failed", job?.id, err.message);
})

export default videoWorker;
