"use client";

import React, { useState } from "react";
import { Box, Button, Heading, Text, TextFieldInput } from "@radix-ui/themes";
import { toast } from "react-toastify";
import Link from "next/link";
import { createRoomAction } from "@/app/actions/create-room";

export default function Page() {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [perHourPrice, setPerHourPrice] = useState("");

  const handleAddRoom = async () => {
    if (!roomNumber.trim() && !roomDescription.trim() && !perHourPrice.trim()) {
      return;
    }
    const result = await createRoomAction({
      room_description: roomDescription,
      per_hour_price: perHourPrice,
      room_number: roomNumber,
    });
    if (result.success) {
      toast.success("Successfully added");
      setRoomNumber("");
      setRoomDescription("");
      setPerHourPrice("");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Box className="space-y-5">
      <Box>
        <Heading>Create a Hotel Room</Heading>
      </Box>
      <form action={handleAddRoom} className="space-y-5">
        <Box>
          <Text>
            Room Number <Text color="red">*</Text>
          </Text>
          <TextFieldInput
            size="3"
            type="number"
            placeholder="Enter Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          ></TextFieldInput>
        </Box>
        <Box>
          <Text>
            Room Description <Text color="red">*</Text>
          </Text>
          <TextFieldInput
            size="3"
            type="text"
            placeholder="Enter Description"
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)}
            required
          ></TextFieldInput>
        </Box>
        <Box>
          <Text>
            Per Hour Price <Text color="red">*</Text>
          </Text>
          <TextFieldInput
            required
            size="3"
            type="number"
            placeholder="Enter Price"
            value={perHourPrice}
            onChange={(e) => setPerHourPrice(e.target.value)}
          ></TextFieldInput>
        </Box>
        <Box className="space-x-5">
          <Link href={"/"}>
            <Button color="gray">Go Back</Button>
          </Link>
          <Button>Add Room</Button>
        </Box>
      </form>
    </Box>
  );
}
