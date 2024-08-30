// cache.js
const NodeCache = require('node-cache');

const tokenCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // TTL of 1 hour

module.exports = tokenCache;
