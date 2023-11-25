import mongoose, { Model } from "mongoose";

const SupplierSchema = new mongoose.Schema({
  contact: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  companyName: {
    type: String,
    required: true
  },
  description: String,
  contractStart: Date,
  contractEnd: Date,
});

const SupplierModel = mongoose.model("Supplier", SupplierSchema);
export { SupplierModel, SupplierSchema };
