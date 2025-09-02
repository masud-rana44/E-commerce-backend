import { z } from "zod";
export const categorySchema = z.object({
  name: z.string().min(2),
  status: z.enum(["active", "inactive"]).optional(),
});
