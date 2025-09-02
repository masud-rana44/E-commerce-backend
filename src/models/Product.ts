import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount?: number;
  images: string[];
  stock: number;
  status: "active" | "inactive";
  categories: Types.ObjectId[];
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
