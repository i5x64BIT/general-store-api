import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema({
  customer: { type: mongoose.Types.ObjectId, required: true },
  soldAt: { type: Date, required: true },
  seller: { type: mongoose.Types.ObjectId, required: true },
  items: [{ type: mongoose.Types.ObjectId, required: true }],
  discounts: [{ type: mongoose.Types.ObjectId }],
});

const ReceiptModel = mongoose.model("Receipt", ReceiptSchema);
export { ReceiptModel, ReceiptSchema };
