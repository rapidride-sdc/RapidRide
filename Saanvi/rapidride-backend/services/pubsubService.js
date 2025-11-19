const { pubClient, subClient } = require("../config/redisClient");

async function publish(channel, message) {
  return pubClient.publish(channel, message);
}

async function subscribe(channel, handler) {
  await subClient.subscribe(channel, (msg) => handler(msg, channel));
}

function setupDefaultListeners() {
  subscribe("driver_updates", (msg) => {
    console.log("[driver_updates]:", msg);
  });

  subscribe("ride_updates", (msg) => {
    console.log("[ride_updates]:", msg);
  });
}

module.exports = {
  publish,
  subscribe,
  setupDefaultListeners
};
