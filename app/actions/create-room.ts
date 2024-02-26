"use server";

import MongoConnectDB from "@/libs/connect";

export async function createRoomAction({
  room_description,
  room_number,
  per_hour_price,
}) {
  try {
    // Check if required fields are provided
    if (!room_number || !room_description || !per_hour_price) {
      throw new Error("Room number, description, and price are required.");
    }

    const collection = (await MongoConnectDB().connect())
      .db("test")
      .collection("rooms");

    // Check if the room already exists
    const existingRoom = await collection.findOne({ room_number });
    if (existingRoom) {
      throw new Error("Room already exists.");
    }

    const dataToInsert = {
      room_description,
      room_number,
      per_hour_price,
      occupied_status: false,
    };

    // Insert the data into the database
    await collection.insertOne(dataToInsert);

    // Return success message
    return { message: "Room created successfully", success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message, success: false };
    }
    return { message: "Something went wrong", success: false };
  }
}
