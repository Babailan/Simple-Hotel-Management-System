"use server";

import MongoConnectDB from "@/libs/connect";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function LoginUser(username: string, password: string) {
  try {
    const db = (await MongoConnectDB().connect()).db("test").collection("user");
    // Check if a user with the provided username and password exists
    const user = await db.findOne({ username, password });

    const cookie = cookies();
    const WEB_TOKEN_PRIVATE_KEY = process.env.WEB_TOKEN_PRIVATE_KEY;

    if (!WEB_TOKEN_PRIVATE_KEY) {
      throw new Error("Please provide a WEB_TOKEN_PRIVATE_KEY in .env.local");
    }

    if (user) {
      delete user["password"];
      delete user["theme"];
      const key = new TextEncoder().encode(WEB_TOKEN_PRIVATE_KEY);
      const newToken = await new SignJWT(user)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24hrs")
        .sign(key);
      cookie.set("token", newToken);
      // User found, you can return some success response or the user object
      return { success: true };
    } else {
      // User not found or password does not match, return an appropriate response
      return { success: false, message: "Invalid username or password" };
    }
  } catch (error) {
    console.error(error);
    // Handle any errors that might occur during the database operation
    return { success: false, message: "An error occurred during login" };
  }
}
