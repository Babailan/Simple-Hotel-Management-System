"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { LoginUser } from "../actions/login-user";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getUserAction } from "../actions/get-user";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  useEffect(() => {
    getUserAction();
  }, []);
  const LoginClient = async () => {
    const response = await LoginUser(username, password);
    if (response.success) {
      router.push("/");
    } else {
      toast.warn(response.message);
    }
  };

  return (
    <Box pt="9">
      <Card size={"4"} className="max-w-md mx-auto">
        <form action={LoginClient}>
          <Box className="space-y-4">
            <Box className="space-y-2">
              <Text>Username</Text>
              <TextField.Input
                size="3"
                onChange={(e) => setUsername(e.target.value)}
              ></TextField.Input>
            </Box>
            <Box className="space-y-2">
              <Text>Password</Text>
              <TextField.Input
                size="3"
                onChange={(e) => setPassword(e.target.value)}
                type="text"
              ></TextField.Input>
            </Box>
            <Box>
              <Button size="3" className="w-full hover:cursor-pointer">
                Log in
              </Button>
            </Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
}
