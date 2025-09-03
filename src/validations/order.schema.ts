import { z } from "zod";
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
      })
    )
    .min(1),
  shipping: z.number().nonnegative(),
});
