"use server";

import MongoConnectDB from "@/libs/connect";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function changeThemeAction() {
  try {
    const dbConnection = await MongoConnectDB().connect();
    const collection = dbConnection.db("test").collection("user");

    const token = cookies().get("token");

    const WEB_TOKEN_PRIVATE_KEY = process.env.WEB_TOKEN_PRIVATE_KEY;

    if (!WEB_TOKEN_PRIVATE_KEY) {
      throw new Error("Please provide a WEB_TOKEN_PRIVATE_KEY in .env.local");
    }
    const key = new TextEncoder().encode(WEB_TOKEN_PRIVATE_KEY);

    // Verify the token and extract user information
    const decodedToken = await jwtVerify(token?.value || "", key);

    const user = await collection.findOne({
      _id: new ObjectId(decodedToken.payload._id as string),
    });
    if (user) {
      await collection.updateOne(
        { _id: new ObjectId(user?._id) },
        { $set: { theme: user.theme == "dark" ? "light" : "dark" } }
      );
    } else {
      throw new Error("");
    }

    revalidatePath("/", "layout");
    return { message: "Theme changed successfully", success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message, success: false };
    }
    return { message: "Something went wrong", success: false };
  }
}
