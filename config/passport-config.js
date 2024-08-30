const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user-model');
const jwt = require('jsonwebtoken');
const tokenCache = require('../utils/cache');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALL_BACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ email: profile._json.email });
        if (!user) {
            user = new User({
                email: profile._json.email,
                name: profile._json.name,
                profilePicture: profile._json.picture,
                oauthProvider: 'google'
            });
            await user.save();
        }

        // Generate token
        let token = tokenCache.get(user.email);
        if (!token) {
            token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            tokenCache.set(user.email, token);
        }

        done(null, { user, token });
    } catch (err) {
        done(err, null);
    }
}));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ username: profile.username });
        if (!user) {
            user = new User({
                username: profile.username,
                name: profile.displayName,
                profilePicture: profile._json.avatar_url,
                oauthProvider: 'github'
            });
            await user.save();
        }

        // Generate token
        let token = tokenCache.get(user.username);
        if (!token) {
            token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            tokenCache.set(user.username, token);
        }

        done(null, { user, token });
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
