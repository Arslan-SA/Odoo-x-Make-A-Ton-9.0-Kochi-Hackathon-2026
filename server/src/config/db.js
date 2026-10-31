const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    try {
      console.log(`Local MongoDB connection failed (${error.message}). Launching embedded Mongo server...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri, { maxPoolSize: 20 });
      console.log(`MongoDB Connected (Embedded): ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`MongoDB connection error: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
