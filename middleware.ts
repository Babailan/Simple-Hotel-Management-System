import {
  MiddlewareConfig,
  getMiddlewareMatchers,
} from "next/dist/build/analysis/get-page-static-info";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JsonWebTokenError } from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const token = cookies().get("token");
  if (!process.env.WEB_TOKEN_PRIVATE_KEY) {
    throw new Error("Please provide a WEB_TOKEN_PRIVATE_KEY in .env.local");
  }
  const key = new TextEncoder().encode(process.env.WEB_TOKEN_PRIVATE_KEY);
  try {
    const result = await jwtVerify(token?.value || "", key);
  } catch (error: any) {
    if (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/"],
};
