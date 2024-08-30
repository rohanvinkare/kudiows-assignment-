const jwt = require('jsonwebtoken');
const tokenCache = require('../utils/cache');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


exports.authenticateToken = (req, res, next) => {
    // Extract email or username from request headers, body, or query
    const email = req.body.email || req.query.email || req.headers['email'] || tokenCache.get(user.email);
    const username = req.body.username || req.query.username || req.headers['username'];

    // Determine the cache key (email or username)
    const cacheKey = email || username;

    if (!cacheKey) return res.status(400).json({ error: 'No email or username provided' });

    // Get the token from cache
    const token = tokenCache.get(cacheKey);

    if (!token) return res.status(401).json({ error: 'Access denied. Login first.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};


