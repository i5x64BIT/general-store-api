import mongoose from "mongoose";

interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  supplier: mongoose.Types.ObjectId;
  tags: string[];
  basePrice: number;
  activeDiscounts: mongoose.Types.ObjectId;
}

const ProductSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  supplier: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  tags: [{ type: String }],
  basePrice: { type: Number, required: true },
  activeDiscounts: [{ type: mongoose.Types.ObjectId }],
});

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export { ProductModel, IProduct };
