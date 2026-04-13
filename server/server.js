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

// Security Middleware
app.use(helmet()); // Secure HTTP headers
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.static('pdfs')); // Serve PDFs

// CORS Configuration - Allow multiple development ports
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Development: Allow localhost on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } 
    // Production: Use environment variable
    else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    }
    else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🚀 DB Connected Successfully");
    cleanupDuplicateEmails();
  })
  .catch(err => console.error("❌ DB Connection Error:", err.message));

// Function to normalize auth data and recreate important indexes
async function cleanupDuplicateEmails() {
  try {
    const User = require('./models/User');
    
    console.log("🔍 Starting email normalization...");
    
    // Normalize emails and remove empty-string phone placeholders.
    const users = await User.find({});
    for (const user of users) {
      if (user.email !== user.email.toLowerCase()) {
        user.email = user.email.toLowerCase().trim();
      }
      if (user.phone === '') {
        user.phone = undefined;
      }
      await user.save();
      console.log(`✓ Normalized user: ${user.email}`);
    }

    // Drop all indexes
    try {
      await User.collection.dropIndexes();
      console.log("✓ Dropped all indexes");
    } catch (e) {
      console.log("ℹ️  No indexes to drop");
    }

    // Find and remove duplicates (same email - keep newest)
    const emailGroups = await User.collection.aggregate([
      { 
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          dates: { $push: '$createdAt' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (emailGroups.length > 0) {
      console.log(`⚠️  Found ${emailGroups.length} duplicate email(s)`);
      
      for (const group of emailGroups) {
        // Sort by date, keep latest, delete older ones
        const sorted = group.ids
          .map((id, i) => ({ id, date: group.dates[i] }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const [keep, ...remove] = sorted;
        if (remove.length > 0) {
          await User.deleteMany({ _id: { $in: remove.map(r => r.id) } });
          console.log(`✓ Removed ${remove.length} duplicate(s) for ${group._id}`);
        }
      }
    }

    // Recreate indexes properly with sparse and unique
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ location: '2dsphere' });
    console.log("✅ Indexes recreated with proper constraints");
  } catch (err) {
    console.error("⚠️  Error during cleanup:", err.message);
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

// Boot Server
const PORT = process.env.PORT || 5001;
// --- THE TRUTH DETECTOR ---
app.get('/test-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.send(`
      <div style="background:#050810; color:#fff; padding:50px; font-family:sans-serif;">
        <h1 style="color:#22c55e;">🟢 DATABASE IS ALIVE!</h1>
        <p>The connection is perfect. We found ${count} users.</p>
      </div>
    `);
  } catch (err) {
    res.send(`
      <div style="background:#050810; color:#fff; padding:50px; font-family:sans-serif;">
        <h1 style="color:#ef4444;">🔴 DATABASE IS DEAD.</h1>
        <p><strong>Error Reason:</strong> ${err.message}</p>
        <p>MongoDB Atlas is blocking you. You need to check your IP Whitelist or your .env password.</p>
      </div>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`🔥 Elite Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔒 Rate limiting and security enabled`);
  
  // Show credential status
  const { checkCredentials } = require('./config/statusCheck');
  checkCredentials();
});
