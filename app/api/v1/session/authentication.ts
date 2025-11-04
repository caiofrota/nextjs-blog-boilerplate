import bcrypt from "bcryptjs";
import { PrismaFactory } from "database";
import { UnauthorizedError } from "errors";
import { createAccessToken, createRefreshToken, verify } from "./jwt";

async function getUserByEmail(username: string) {
  const user = await PrismaFactory.getInstance().user.findUnique({ where: { email: username } });
  if (!user) {
    throw new UnauthorizedError({
      message: "User not found.",
      action: "Please check the username and try again.",
      errorLocationCode: "SESSION:AUTHENTICATION:GET_USER_BY_EMAIL:USER_NOT_FOUND",
    });
  }
  return user;
}

async function comparePasswords(password: string, hashedPassword: string) {
  const match = await bcrypt.compare(password, hashedPassword);
  if (!match) {
    throw new UnauthorizedError({
      message: "Invalid password.",
      action: "Please check your password and try again.",
      errorLocationCode: "SESSION:AUTHENTICATION:COMPARE_PASSWORDS:PASSWORD_MISMATCH",
    });
  }
}

export async function authenticateWithCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);
  await comparePasswords(password, user.password);
  return {
    accessToken: await createAccessToken({ sub: String(user.id), email, role: user.role }),
    refreshToken: await createRefreshToken({ sub: String(user.id) }),
  };
}

export async function authenticateWithRefreshToken(refreshToken: string) {
  try {
    const { sub } = await verify(refreshToken);
    const user = await PrismaFactory.getInstance().user.findUnique({ where: { id: Number(sub) } });
    if (!user) throw new UnauthorizedError({ message: "User not found." });
    return {
      accessToken: await createAccessToken({ sub: String(user.id), email: user.email, role: user.role }),
      refreshToken: await createRefreshToken({ sub: String(user.id) }),
    };
  } catch (error) {
    throw new UnauthorizedError({
      message: "Invalid refresh token.",
      action: "Please provide a valid refresh token.",
    });
  }
}
