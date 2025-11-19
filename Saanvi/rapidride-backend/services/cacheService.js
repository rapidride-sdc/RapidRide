const { client } = require("../config/redisClient");

const RIDE_PREFIX = "ride:";
const SESSION_PREFIX = "session:";

async function cacheRide(rideId, rideData, ttl = 300) {
  await client.set(RIDE_PREFIX + rideId, JSON.stringify(rideData), { EX: ttl });
}

async function getCachedRide(rideId) {
  const raw = await client.get(RIDE_PREFIX + rideId);
  return raw ? JSON.parse(raw) : null;
}

async function cacheSession(userId, data, ttl = 3600) {
  await client.set(SESSION_PREFIX + userId, JSON.stringify(data), { EX: ttl });
}

async function getSession(userId) {
  const raw = await client.get(SESSION_PREFIX + userId);
  return raw ? JSON.parse(raw) : null;
}

module.exports = {
  cacheRide,
  getCachedRide,
  cacheSession,
  getSession
};
