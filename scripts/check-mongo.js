require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is not set. Check .env file.');
  process.exit(1);
}

console.log('Testing MongoDB connection to:', uri.split('@').pop?.() ?? uri);

mongoose.set('strictQuery', false);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    if (err.reason) console.error('Reason:', err.reason);
    process.exit(1);
  });
