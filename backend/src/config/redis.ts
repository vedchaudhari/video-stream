const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null, // required for BullMQ
});

// connection events
redis.on("connect", () => {
  console.log("🟥 Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});


export default redis;