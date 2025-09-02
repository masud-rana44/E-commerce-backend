import { Request, Response } from "express";
import { Category } from "../models/Category";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { categorySchema } from "../validations/category.schema";
import { slugify } from "../utils/slugify";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, status } = categorySchema.parse(req.body);
    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Category exists" });
    const cat = await Category.create({ name, slug, status });
    res.status(201).json(new ApiResponse(cat));
  }
);

export const listCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const cats = await Category.find().sort({ name: 1 });
    res.json(new ApiResponse(cats));
  }
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, status } = categorySchema.partial().parse(req.body);
    const updates: any = {};
    if (name) {
      updates.name = name;
      updates.slug = slugify(name);
    }
    if (status) updates.status = status;
    const cat = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.json(new ApiResponse(cat));
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json(new ApiResponse({ id: req.params.id }, "deleted"));
  }
);
