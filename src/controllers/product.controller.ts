import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { productSchema } from "../validations/product.schema";
import { slugify } from "../utils/slugify";

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const body = productSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      discount:
        req.body.discount !== undefined ? Number(req.body.discount) : undefined,
      stock: Number(req.body.stock),
      images: req.body.images,
    });

    const slug = slugify(body.name);
    const images =
      (req.files as Express.Multer.File[] | undefined)?.map(
        (f) => `/uploads/${f.filename}`
      ) ||
      body.images ||
      [];

    const created = await Product.create({ ...body, slug, images });
    res.status(201).json(new ApiResponse(created));
  }
);

export const listProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "12", 10);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || undefined;
    const category = (req.query.category as string) || undefined;

    const filter: any = {};
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    if (status) filter.status = status;
    if (category) filter.categories = category;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("categories")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json(new ApiResponse({ items, page, limit, total }));
  }
);

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const item = await Product.findById(req.params.id).populate("categories");
  res.json(new ApiResponse(item));
});

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const body = productSchema.partial().parse({
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      discount:
        req.body.discount !== undefined ? Number(req.body.discount) : undefined,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
    });

    const imagesFromUpload =
      (req.files as Express.Multer.File[] | undefined)?.map(
        (f) => `/uploads/${f.filename}`
      ) || [];
    const updates: any = { ...body };
    if (body.name) updates.slug = slugify(body.name);
    if (imagesFromUpload.length)
      updates.$push = { images: { $each: imagesFromUpload } };

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.json(new ApiResponse(updated));
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json(new ApiResponse({ id: req.params.id }, "deleted"));
  }
);
