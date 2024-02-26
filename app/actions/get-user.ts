"use server";

import MongoConnectDB from "@/libs/connect";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getUserAction() {
  try {
    const collection = (await MongoConnectDB().connect())
      .db("test")
      .collection("user");

    const token = cookies().get("token");

    const WEB_TOKEN_PRIVATE_KEY = process.env.WEB_TOKEN_PRIVATE_KEY;

    if (!WEB_TOKEN_PRIVATE_KEY) {
      throw new Error("Please provide a WEB_TOKEN_PRIVATE_KEY in .env.local");
    }

    const key = new TextEncoder().encode(WEB_TOKEN_PRIVATE_KEY);
    const decode = await jwtVerify(token?.value || "", key);
    const user = await collection.findOne({
      _id: new ObjectId(decode.payload._id as string),
    });

    revalidatePath("/*", "layout");
    return user;
  } catch (error) {
    return null;
  }
}
