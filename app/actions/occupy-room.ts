"use server";

import MongoConnectDB from "@/libs/connect";
import { revalidatePath } from "next/cache";

export async function occupyRoomAction({ occupant, room_number, per_hour }) {
  try {
    const collection = (await MongoConnectDB().connect())
      .db("test")
      .collection("rooms");

    // Check if required fields are provided
    if (!occupant || !room_number) {
      throw new Error("Room number and occupant are required.");
    }
    const findResult = await collection.findOne({ room_number });

    if (findResult == null) {
      throw new Error("Room is not found.");
    }
    const occupant_price = findResult.per_hour_price * per_hour;

    const occupant_issued_start = new Date();
    const occupant_issued_end = new Date();

    occupant_issued_end.setHours(
      occupant_issued_end.getHours() + Number(per_hour)
    );

    const updated = await collection.updateOne(
      { room_number },
      {
        $set: {
          occupant,
          occupied_status: true,
          occupant_issued_start,
          occupant_issued_end,
          occupant_price,
        },
      }
    );

    if (updated.modifiedCount === 1) {
      revalidatePath("/", "layout");
      return {
        message: "Room updated successfully",
        success: true,
      };
    } else {
      return {
        message: "Room not found or not updated",
        success: false,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message, success: false };
    }
    return { message: "Something went wrong", success: false };
  }
}
