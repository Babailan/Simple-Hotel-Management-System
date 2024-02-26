"use server";

import MongoConnectDB from "@/libs/connect";
import { revalidatePath } from "next/cache";

export async function extendOccupancyAction({ room_number, additional_hours }) {
  try {
    const collection = (await MongoConnectDB().connect())
      .db("test")
      .collection("rooms");

    // Check if required fields are provided
    if (!room_number || !additional_hours) {
      throw new Error("Room number and additional hours are required.");
    }

    const findResult = await collection.findOne({ room_number });

    if (findResult == null) {
      throw new Error("Room is not found.");
    }

    // Calculate the new occupant_issued_end
    const occupant_issued_end = new Date(findResult.occupant_issued_end);
    occupant_issued_end.setHours(
      occupant_issued_end.getHours() + Number(additional_hours)
    );

    // // Calculate the new occupant_price
    const old_occupant_price = findResult.occupant_price;
    const extend_price =
      Number(findResult.per_hour_price) * Number(additional_hours);

    const updated = await collection.updateOne(
      { room_number },
      {
        $set: {
          occupant_issued_end,
          occupant_price: Number(old_occupant_price) + Number(extend_price),
        },
      }
    );

    if (updated.modifiedCount === 1) {
      revalidatePath("/", "layout");
      return {
        message: "Room occupancy extended successfully",
        success: true,
      };
    } else {
      return {
        message: "Room not found or occupancy not extended",
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
