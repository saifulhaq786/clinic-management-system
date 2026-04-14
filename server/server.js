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
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again in a few minutes.' }
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
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
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
app.use('/api/mobile', require('./routes/mobile'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blood', require('./routes/blood')); // New Blood Bank routes


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
