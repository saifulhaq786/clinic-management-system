require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const setupSocket = require('./config/socket');

const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';

// CRITICAL for Render/Proxies: Correctly identify user IP
app.set('trust proxy', 1);

// CORS — allow all origins (auth is handled via JWT, not CORS)
app.use(cors({ origin: true, credentials: true }));

// Helmet — configured to NOT interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
}));

// Version header — helps confirm which deploy is live
const DEPLOY_VERSION = '2026-04-14-v2';
app.use((req, res, next) => {
  res.setHeader('X-Deploy-Version', DEPLOY_VERSION);
  next();
});

// Rate limiters — return JSON errors, not plain text
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased for stability
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProduction || req.path.startsWith('/api/auth') || req.path.startsWith('/api/mobile'),
  message: { error: 'Too many requests. Please try again in a few minutes.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for launch testing
  skip: () => !isProduction,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again in a few minutes.' }
});
const mobileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  skip: () => !isProduction,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP attempts. Please wait a few minutes and try again.' }
});
app.use(limiter);

// Body parser with expanded limits for base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('pdfs'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected Successfully");
    // Only ensure indexes exist — no destructive cleanup
    ensureIndexes();
  })
  .catch(err => console.error("DB Connection Error:", err.message));

// Safe index creation — no dropping, no destructive operations
async function ensureIndexes() {
  try {
    const User = require('./models/User');
    const indexes = await User.collection.indexes();
    const firebaseUidIndex = indexes.find((index) => index.name === 'firebaseUid_1');

    if (firebaseUidIndex && (!firebaseUidIndex.unique || !firebaseUidIndex.sparse)) {
      await User.collection.dropIndex('firebaseUid_1');
      console.log('Replaced outdated firebaseUid_1 index');
    }

    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ location: '2dsphere' });
    console.log("DB indexes verified");
  } catch (err) {
    // Index already exists — that's fine
    if (err.code !== 85 && err.code !== 86) {
      console.error("Index creation warning:", err.message);
    }
  }
}

// Setup Real-time WebSocket
const io = setupSocket(server);
app.set('io', io);

// Route Integrations
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/mobile', mobileLimiter, require('./routes/mobile'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blood', require('./routes/blood')); // New Blood Bank routes
app.use('/api/clinics', require('./routes/clinics')); // New Clinics registration routes


// Health check
const PORT = process.env.PORT || 5001;

app.get('/test-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.json({ status: 'ok', users: count, version: DEPLOY_VERSION });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  
  const { checkCredentials } = require('./config/statusCheck');
  checkCredentials();
});
