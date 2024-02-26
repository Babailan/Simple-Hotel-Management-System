"use server";

import MongoConnectDB from "@/libs/connect";

export async function getHistoryAction() {
  try {
    const dbConnection = await MongoConnectDB().connect();
    const historyCollection = dbConnection
      .db("test")
      .collection("rent-history");

    const result = await historyCollection.find({}).toArray();
    return result;
  } catch (error) {
    return null;
  }
}
