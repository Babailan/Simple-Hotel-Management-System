"use client";

import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Link as RadixLink,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listOfRoomAction } from "./actions/list-of-rooms";
import React, { useEffect, useState } from "react";
import { occupyRoomAction } from "./actions/occupy-room";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Countdown from "react-countdown";
import { unoccupyRoomAction } from "./actions/unoccupied";
import { extendOccupancyAction } from "./actions/extend-occupied-room";

export default function Home() {
  const [cookies, setCookies, removeCookies] = useCookies();

  const { data, isPending } = useQuery({
    queryKey: ["list-of-rooms"],
    queryFn: async () => JSON.parse(await listOfRoomAction()),
  });
  const router = useRouter();

  if (isPending) {
    return (
      <Box>
        <Heading>Loading....</Heading>
      </Box>
    );
  }

  return (
    <Box className="space-y-5">
      <Flex justify="between">
        <Link href={"/create-room"} legacyBehavior passHref>
          <RadixLink>Create a Hotel Room</RadixLink>
        </Link>
        <Link href={"/history"} legacyBehavior passHref>
          <RadixLink>History</RadixLink>
        </Link>
      </Flex>

      <OccupiedRoom data={data} />
      <AvailableRoom data={data} />

      <Button
        className="hover:cursor-pointer"
        onClick={() => {
          removeCookies("token");
          router.push("/login");
        }}
      >
        Log out
      </Button>
    </Box>
  );
}

const AvailableRoom = ({ data }) => {
  const [occupant, setOccupant] = useState("");
  const [perHour, setPerHour] = useState("");
  const queryClient = useQueryClient();

  const occupyRoom = async (room_number) => {
    const result = await occupyRoomAction({
      occupant,
      room_number,
      per_hour: perHour,
    });
    if (result.success) {
      toast.success("Successfully Occupied");
      queryClient.refetchQueries();
    } else {
      toast.error(result.message);
    }
  };
  const available_room_count = data?.reduce(
    (p, c) => p + (c.occupied_status ? 0 : 1),
    0
  );
  return (
    <>
      <Box className="space-y-2">
        <Heading size="5">Available Rooms</Heading>
        <Flex wrap={"wrap"} gap={"5"}>
          {data?.map((room, idx) => {
            if (room.occupied_status) {
              return null;
            }
            return (
              <Dialog.Root
                key={idx}
                onOpenChange={(change) => {
                  if (!change) {
                    setOccupant("");
                    setPerHour("");
                  }
                }}
              >
                <Dialog.Trigger>
                  <Card
                    style={{ width: 350 }}
                    size={"4"}
                    className="hover:cursor-pointer"
                  >
                    <Heading size={"4"}>Room {room.room_number}</Heading>
                    <Text size="2" color="gray" className="line-clamp-3">
                      {room.room_description}
                    </Text>
                    <Box mt="2" className="font-bold">
                      <Text size="2" color="gray" className="line-clamp-3">
                        Per Hour : ₱ {room.per_hour_price}
                      </Text>
                    </Box>
                  </Card>
                </Dialog.Trigger>

                <Dialog.Content style={{ maxWidth: 450 }}>
                  <Dialog.Title>Occupying Room</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Make sure information are authentic.
                  </Dialog.Description>

                  <Flex direction="column" gap="3">
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Occupant Name
                      </Text>

                      <TextField.Input
                        placeholder="Enter full name"
                        onChange={(e) => setOccupant(e.target.value)}
                        value={occupant}
                      />
                    </label>
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Length of accommodation (Per Hours)
                      </Text>
                      <TextField.Input
                        type="number"
                        onChange={(e) => setPerHour(e.target.value)}
                        value={perHour}
                      />
                    </label>
                  </Flex>
                  <Box mt="4">
                    <Text size="2">
                      Total Amount : ₱ {Number(perHour) * room.per_hour_price}
                    </Text>
                  </Box>

                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button onClick={() => occupyRoom(room.room_number)}>
                        Save
                      </Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            );
          })}
        </Flex>
      </Box>

      {!!available_room_count || (
        <Card>
          <Flex justify="center" py="9">
            <Heading size="4">No available room</Heading>
          </Flex>
        </Card>
      )}
    </>
  );
};
const OccupiedRoom = ({ data }) => {
  const [date, setDate] = useState(new Date());
  const queryClient = useQueryClient();
  const [additionalHours, setAdditionalHours] = useState("");

  useEffect(() => {
    const dateInterval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(dateInterval);
    };
  }, []);

  const occupied_room_count = data?.reduce(
    (p, c) => p + (c.occupied_status ? 1 : 0),
    0
  );

  return (
    <Box className="space-y-2">
      <Heading size="5">Occupied Rooms</Heading>
      <Flex wrap={"wrap"} gap={"5"}>
        {data
          ?.filter((room) => room.occupied_status)
          .map((room, idx) => {
            const end = new Date(room.occupant_issued_end);
            return (
              <Dialog.Root
                key={idx}
                onOpenChange={() => setAdditionalHours("")}
              >
                <Dialog.Trigger>
                  <Card
                    style={{ width: 350 }}
                    size={"4"}
                    className="hover:cursor-pointer"
                  >
                    <Heading size={"4"}>Room {room.room_number}</Heading>
                    <Text
                      as="p"
                      size="2"
                      color="gray"
                      className={"line-clamp-3"}
                    >
                      {room.room_description}
                    </Text>
                    <Box py="2">
                      <Text size="2" className="capitalize">
                        Occupant Name : {room.occupant}
                      </Text>
                      <Countdown
                        date={end}
                        overtime={true}
                        renderer={(test) => {
                          // If exceed
                          if (test.completed) {
                            const exceedPenalty =
                              Math.abs(end.getTime() - date.getTime()) /
                              (1000 * 60 * 60);
                            return (
                              <>
                                <Text
                                  size="2"
                                  color="red"
                                  as="p"
                                  weight="medium"
                                >
                                  Time Exceed :{" "}
                                  {`${test.formatted.days}:${test.formatted.hours}:${test.formatted.minutes}:${test.formatted.seconds}`}
                                </Text>
                                <Text as="p" size="2" weight="medium">
                                  Penalty : ₱{" "}
                                  {(
                                    exceedPenalty * room.per_hour_price
                                  ).toFixed(2)}
                                </Text>
                                <Text as="p" size="2" weight="medium">
                                  Room Price : ₱ {room.occupant_price}
                                </Text>
                              </>
                            );
                          }
                          return (
                            <>
                              <Text
                                size="2"
                                as="p"
                                color="grass"
                                weight="medium"
                              >
                                Time Left :{" "}
                                {`${test.formatted.days}:${test.formatted.hours}:${test.formatted.minutes}:${test.formatted.seconds}`}
                              </Text>
                              <Text as="p" size="2" weight="medium">
                                Room Price : ₱ {room.occupant_price}
                              </Text>
                            </>
                          );
                        }}
                      />
                      <Text></Text>
                    </Box>
                  </Card>
                </Dialog.Trigger>

                <Dialog.Content style={{ maxWidth: 450 }}>
                  <Dialog.Title>Edit Room {room.room_number}</Dialog.Title>
                  <Dialog.Description size="2">
                    Make changes to the room.
                  </Dialog.Description>
                  <Box className="mt-5">
                    <Text size="2">Extend time (Per Hours)</Text>
                    <TextField.Input
                      onChange={(e) => setAdditionalHours(e.target.value)}
                    ></TextField.Input>
                    <Flex mt="5" justify="end" gap={"2"}>
                      <Dialog.Close>
                        <Button
                          onClick={async () => {
                            const toastID = toast.loading(
                              "Updating the room..."
                            );
                            const result = await extendOccupancyAction({
                              room_number: room.room_number,
                              additional_hours: additionalHours,
                            });
                            if (result.success) {
                              await queryClient.refetchQueries();
                              toast.update(toastID, {
                                type: "success",
                                render: result.message,
                                isLoading: false,
                                autoClose: 3000,
                              });
                            } else {
                              toast.update(toastID, {
                                type: "error",
                                render: result.message,
                                isLoading: false,
                                autoClose: 3000,
                              });
                            }
                          }}
                        >
                          Extend Session
                        </Button>
                      </Dialog.Close>
                      <Dialog.Close>
                        <Button
                          color="red"
                          onClick={async () => {
                            const result = await unoccupyRoomAction({
                              room_number: room.room_number,
                            });
                            if (result.success) {
                              toast.success(result.message);
                              queryClient.refetchQueries();
                            } else {
                              toast.error(result.message);
                            }
                          }}
                        >
                          End Session
                        </Button>
                      </Dialog.Close>
                    </Flex>
                  </Box>
                </Dialog.Content>
              </Dialog.Root>
            );
          })}
      </Flex>
      {!!occupied_room_count || (
        <Card>
          <Flex justify="center" py="9">
            <Heading size="4">No occupied room</Heading>
          </Flex>
        </Card>
      )}
    </Box>
  );
};
