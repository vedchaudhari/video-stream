import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URI as string, {
  maxRetriesPerRequest: null, // required for BullMQ
});

// connection events
redis.on("connect", () => {
  console.log("🟥 Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});


export default redis;