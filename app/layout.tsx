import "@radix-ui/themes/styles.css";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  Box,
  Code,
  Container,
  Flex,
  Heading,
  ScrollArea,
  Text,
  Theme,
  Tooltip,
} from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";

import ReactQueryProvider from "./react-query";
import Image from "next/image";
import ChangeTheme from "./components/theme/ChangeTheme";
import { getUserAction } from "./actions/get-user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hotel Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const account = await getUserAction();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReactQueryProvider>
          <ToastContainer autoClose={2000} position="top-left" />
          <Theme
            appearance={(account?.theme as "light" | "dark") || "light"}
            accentColor="purple"
          >
            <ScrollArea className="max-h-screen p-10">
              <Container size="3">
                <Flex align={"start"} justify={"between"} mb="5">
                  <Flex direction="column" gap={"2"}>
                    <Flex align="center" gap="2">
                      <Image
                        src={"/logo.png"}
                        alt=""
                        width={75}
                        height={75}
                      ></Image>
                      <Box>
                        <Heading>Hotel Management System</Heading>
                        <Text color="gray">
                          <Code>Simplicity is the king</Code>
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Tooltip content="Change the theme">
                      {!account || <ChangeTheme />}
                    </Tooltip>
                  </Flex>
                </Flex>
                {children}
              </Container>
            </ScrollArea>
          </Theme>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
