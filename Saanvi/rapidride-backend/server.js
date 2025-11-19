require("dotenv").config();

const { connectRedis } = require("./config/redisClient");
const { setupDefaultListeners } = require("./services/pubsubService");

(async () => {
  await connectRedis();
  setupDefaultListeners();

  console.log("🚀 RapidRide backend is running...");
})();
