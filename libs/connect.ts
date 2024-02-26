import { MongoClient } from "mongodb";

// Connection URI
const uri = process.env.MONGO_URI;

// Create a new MongoClient

function MongoConnectDB() {
  if (!uri) {
    throw new Error("MONGO_URI env is required");
  }
  const client = new MongoClient(uri);
  return client;
}

// Connect to the MongoDB server

export default MongoConnectDB;
