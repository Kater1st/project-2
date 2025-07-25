const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in .env');
}

const client = new MongoClient(uri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(); // defaults to database in URI (library)
    console.log('Connected to MongoDB');
  }
  return db;
}

function getCollection(name) {
  if (!db) throw new Error('Database not connected. Call connectDB first.');
  return db.collection(name);
}

module.exports = { connectDB, getCollection };
