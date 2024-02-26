"use server";

import MongoConnectDB from "@/libs/connect";
import { revalidateTag } from "next/cache";

export async function listOfRoomAction() {
  const collection = (await MongoConnectDB().connect())
    .db("test")
    .collection("rooms");
  const data = await collection.find({}).toArray();
  revalidateTag("/list-of-room");
  return JSON.stringify(data);
}
