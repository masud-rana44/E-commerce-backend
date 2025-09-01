import { Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { signAccessToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validations/auth.schema";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: parsed.email });
  if (exists) throw new ApiError(409, "Email already in use");
  const user = await User.create(parsed);
  const token = signAccessToken({ id: user.id, role: user.role });

  res.status(201).json(
    new ApiResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
        },
        accessToken: token,
      },
      "registered"
    )
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const user = await User.findOne({ email: parsed.email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");
  const ok = await user.comparePassword(parsed.password);
  if (!ok) throw new ApiError(401, "Invalid credentials");
  const token = signAccessToken({ id: user.id, role: user.role });
  res.json(
    new ApiResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
        },
        accessToken: token,
      },
      "logged-in"
    )
  );
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  res.json(new ApiResponse(user));
});
