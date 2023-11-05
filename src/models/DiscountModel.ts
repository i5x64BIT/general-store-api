import mongoose, { Model } from "mongoose";

enum EDiscountType {
  percentage = "percentage",
  fixedPrice = "fixed",
}
const DiscountSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  description: String,
  products: [{ type: mongoose.Types.ObjectId }],
  createdAt: { type: Date, required: true, default: Date.now() },
  updatedAt: { type: Date, required: true, default: Date.now() },
  discountType: {
    type: String,
    enum: EDiscountType,
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
});

const DiscountModel = mongoose.model("Discount", DiscountSchema);
export { DiscountModel, DiscountSchema, EDiscountType };
