"use server";

import MongoConnectDB from "@/libs/connect";
import { revalidatePath } from "next/cache";

export async function unoccupyRoomAction({ room_number }) {
  try {
    const connect = (await MongoConnectDB().connect()).db("test");
    const roomCollection = connect.collection("rooms");
    const rentHistory = connect.collection("rent-history");

    // Check if required fields are provided
    if (!room_number) {
      throw new Error("Room number is required.");
    }

    const findResult = await roomCollection.findOne({ room_number });

    let penalty = 0;
    const currentDate = new Date();
    const occupantIssuedEnd = findResult?.occupant_issued_end
      ? new Date(findResult.occupant_issued_end)
      : null;

    if (
      occupantIssuedEnd &&
      occupantIssuedEnd.getTime() < currentDate.getTime()
    ) {
      const timeDifference =
        Math.abs(currentDate.getTime() - occupantIssuedEnd.getTime()) /
        (1000 * 60 * 60);
      penalty = timeDifference * Number(findResult?.per_hour_price);
    }
    if (findResult == null) {
      throw new Error("Room is not found.");
    }

    const updated = await roomCollection.updateOne(
      { room_number },
      {
        $set: {
          occupied_status: false,
        },
        $unset: {
          occupant_issued_start: "",
          occupant_price: "",
          occupant_issued_end: "",
          occupant: "",
        },
      }
    );

    if (updated.modifiedCount === 1) {
      revalidatePath("/list-of-room");
      const { _id, ...result } = findResult;
      const history = await rentHistory.insertOne({ ...result, penalty });
      if (history.acknowledged) {
        return {
          message: "Room unoccupied successfully",
          success: true,
        };
      } else {
        return {
          message: "Updating failed",
          success: false,
        };
      }
    } else {
      return {
        message: "Room not found or not unoccupied",
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
