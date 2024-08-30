require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const resumeRoutes = require('./routes/resume-routes');
const resumeAdminRoutes = require('./routes/resume-admin-routes');
const authenticateToken = require('./middleware/auth-middleware').authenticateToken;
const multer = require('multer');

const path = require('path');
const { render } = require('ejs');

require('./config/passport-config');

const mongoURI = process.env.MONGODB_URI;

const app = express();
const upload = multer();

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use(express.static('uploads'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    keys: [process.env.COOKIE_KEY]
}));

app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use(authRoutes);

// Include resume routes
app.use(resumeRoutes);
app.use(resumeAdminRoutes);


// GET request
app.get('/', (req, res) => {
    res.render('info');
});


// GET request
app.get('/home', (req, res) => {
    res.render('home');
});

// GET request
app.get('/login', (req, res) => {
    res.render('login');
});


// GET request
app.get('/signup', (req, res) => {
    res.render('signup');
});

// GET request
app.get('/otp', (req, res) => {
    res.render('otp');
});

// GET request
app.get('/user-dashboard', (req, res) => {
    // res.render('UserDashboard');
    res.status(200).render('UserDashboard');
});

app.get('/success', (req, res) => {
    res.render('success');
});

app.get('/hr-dashboard', (req, res) => {
    res.status(200).render('HrDashboard');
});


// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

app.listen(3000, () => console.log('Server running on port 3000'));
