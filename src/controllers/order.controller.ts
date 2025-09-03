import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createOrderSchema } from "../validations/order.schema";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shipping } = createOrderSchema.parse(req.body);

  // verify stock & snapshot prices
  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  for (const item of items) {
    const p = map.get(item.product);
    if (!p) throw new ApiError(400, "Invalid product in cart");
    if (p.stock < item.quantity)
      throw new ApiError(400, `Stock out: ${p.name}`);
    const priceAfterDiscount = p.price * (1 - (p.discount || 0) / 100);
    subtotal += priceAfterDiscount * item.quantity;
  }

  const total = subtotal + shipping;

  const order = await Order.create({
    user: req.user!.id,
    items: items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      price: map.get(i.product)!.price,
    })),
    subtotal,
    shipping,
    total,
    status: "pending",
  });

  // decrement stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(201).json(new ApiResponse(order));
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({
    createdAt: -1,
  });
  res.json(new ApiResponse(orders));
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, status } = req.query as {
    from?: string;
    to?: string;
    status?: string;
  };
  const filter: any = {};
  if (status) filter.status = status;
  if (from || to)
    filter.placedAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };

  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "20", 10);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("user")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  res.json(new ApiResponse({ items, page, limit, total }));
});

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(new ApiResponse(order));
  }
);
