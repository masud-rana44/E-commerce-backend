import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw new ApiError(401, "Unauthorized");
  const token = auth.split(" ")[1];

  const payload = verifyAccessToken(token);
  req.user = { id: payload.id, role: payload.role as any };
  next();
};

export const restrictTo =
  (...roles: Array<"admin" | "user">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as any))
      throw new ApiError(403, "Forbidden");
    next();
  };
