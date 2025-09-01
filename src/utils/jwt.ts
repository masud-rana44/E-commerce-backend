import jwt, { Secret, SignOptions } from "jsonwebtoken";

export const signAccessToken = (payload: object) =>
  jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions
  );

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
    id: string;
    role: string;
  };
