import { z } from "zod";
export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  discount: z.number().min(0).max(100).optional().default(0),
  stock: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive"]).optional(),
  categories: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});
