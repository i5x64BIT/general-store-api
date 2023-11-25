import mongoose from "mongoose";

interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  supplier: mongoose.Types.ObjectId;
  tags: string[];
  basePrice: number;
  activeDiscounts: mongoose.Types.ObjectId;
  isEnabled: boolean;
}

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  supplier: {
    type: mongoose.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  tags: [{ type: String }],
  basePrice: { type: Number, required: true },
  activeDiscounts: [{ type: mongoose.Types.ObjectId, ref: "Discount" }],
  isEnabled: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export { ProductModel, IProduct };
