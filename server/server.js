require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
for (const k of ['MONGODB_URI', 'JWT_SECRET']) if (!process.env[k]) { console.error(`Missing env var ${k}. See .env.example`); process.exit(1); }
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Promise.all(Object.values(mongoose.models).map(m => m.init())); // make sure unique indexes exist
  app.listen(process.env.PORT || 5000, () => console.log(`API listening on ${process.env.PORT || 5000}`));
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
