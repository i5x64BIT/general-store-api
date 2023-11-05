import mongoose, { Model } from "mongoose";

const ProductSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId()
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
  activeDiscounts: [{type: mongoose.Types.ObjectId}]
});

const ProductModel = mongoose.model("Product", ProductSchema);
export { ProductModel, ProductSchema };
