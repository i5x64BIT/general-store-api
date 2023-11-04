import mongoose, { Model } from "mongoose";

const SupplierSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
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
  contractFile: Blob
});

const SupplierModel = mongoose.model("Supplier", SupplierSchema);
export { SupplierModel, SupplierSchema };
