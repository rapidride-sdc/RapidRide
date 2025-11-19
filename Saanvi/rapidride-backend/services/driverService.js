const { client } = require("../config/redisClient");
const { publish } = require("./pubsubService");

const DRIVER_HASH_KEY = "drivers:hash";
const DRIVER_GEO_KEY = "drivers:geo";
const DRIVER_AVAIL_KEY = "drivers:availability";

async function registerDriver(driverId, location) {
  const { latitude, longitude, meta = {} } = location;

  await client.hSet(DRIVER_HASH_KEY, driverId, JSON.stringify(meta));
  await client.hSet(DRIVER_AVAIL_KEY, driverId, "available");

  await client.sendCommand([
    "GEOADD",
    DRIVER_GEO_KEY,
    longitude,
    latitude,
    driverId
  ]);

  await publish("driver_updates", JSON.stringify({ event: "REGISTER", driverId }));
  return true;
}

async function updateDriverLocation(driverId, { latitude, longitude }) {
  await client.sendCommand([
    "GEOADD",
    DRIVER_GEO_KEY,
    longitude,
    latitude,
    driverId
  ]);

  await publish("driver_updates", JSON.stringify({ event: "UPDATE_LOCATION", driverId }));
  return true;
}

async function findNearestDriver(userLocation, radiusKm = 5) {
  const { latitude, longitude } = userLocation;

  const radiusMeters = radiusKm * 1000;

  const result = await client.sendCommand([
    "GEORADIUS",
    DRIVER_GEO_KEY,
    longitude,
    latitude,
    radiusMeters.toString(),
    "m",
    "WITHDIST",
    "ASC",
    "COUNT",
    "20"
  ]);

  if (!result || result.length === 0) return null;

  for (const entry of result) {
    const driverId = entry[0].toString();
    const distance = parseFloat(entry[1]);

    const isAvailable = await client.hGet(DRIVER_AVAIL_KEY, driverId);

    if (isAvailable === "available") {
      await client.hSet(DRIVER_AVAIL_KEY, driverId, "busy");

      await publish("ride_updates", JSON.stringify({
        event: "ASSIGN",
        driverId,
        distance
      }));

      return { driverId, distance };
    }
  }

  return null;
}

module.exports = {
  registerDriver,
  updateDriverLocation,
  findNearestDriver
};
