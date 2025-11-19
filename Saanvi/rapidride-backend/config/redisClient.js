const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (err) => console.error("Redis Error:", err));

const pubClient = client.duplicate();
const subClient = client.duplicate();

async function connectRedis() {
  if (!client.isOpen) await client.connect();
  if (!pubClient.isOpen) await pubClient.connect();
  if (!subClient.isOpen) await subClient.connect();
}

module.exports = {
  client,
  pubClient,
  subClient,
  connectRedis
};
