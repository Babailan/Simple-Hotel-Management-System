"use client";

import { Box, Button, Flex, Heading, Table } from "@radix-ui/themes";
import { getHistoryAction } from "../actions/get-history";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { data, isPending } = useQuery({
    queryKey: ["history-action-get"],
    queryFn: async () => await getHistoryAction(),
  });

  if (isPending) {
    return <></>;
  }

  return (
    <Box className="space-y-3">
      <Flex justify="between">
        <Heading>Rent History</Heading>
        <Link href={"/"}>
          <Button>Go Back</Button>
        </Link>
      </Flex>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Occupant Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Room Number</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Penalty</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data?.map((room, idx) => {
            return (
              <Table.Row key={idx} className="capitalize">
                <Table.RowHeaderCell>{room.occupant}</Table.RowHeaderCell>
                <Table.Cell>{room.room_number}</Table.Cell>
                <Table.Cell>₱ {room.occupant_price}</Table.Cell>
                <Table.Cell>₱ {room.penalty}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
