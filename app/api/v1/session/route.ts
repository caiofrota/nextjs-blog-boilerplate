import bcrypt from "bcryptjs";
import { UnauthorizedError } from "errors";
import { withErrorHandling } from "errors/handler";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { authenticateWithCredentials } from "./authentication";

export async function GET(req: Request) {
  console.log(req);
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

async function handlePost(req: NextRequest) {
  const startMs = Date.now();
  try {
    const body = await req.json();
    const { username, password } = schema.parse(body);

    const tokens = await authenticateWithCredentials(username, password);

    const res = NextResponse.json({ status: "ok" }, { status: 200 });

    res.cookies.set(process.env.ACCESS_TOKEN_NAME ?? "access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set(process.env.REFRESH_TOKEN_NAME ?? "refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (error) {
    // Mitigate timing attacks
    if (Date.now() - startMs < 10) await bcrypt.hash("password", 10);
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Username or password is incorrect.",
        action: "Please check your username and password and try again.",
      });
    }
    throw error;
  }
}

export const POST = await withErrorHandling(handlePost);

const schema = z.object({
  username: z.email().nonempty(),
  password: z.string().nonempty(),
});
