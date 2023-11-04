import mongoose, { Model } from "mongoose";

const CategorySchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  description: String,
  products: [{type: mongoose.Types.ObjectId}],
  createdAt: {type: Date, required: true, default: Date.now()},
  updatedAt: {type: Date, required: true, default: Date.now()}
});

const CategoryModel = mongoose.model("Category", CategorySchema);
export { CategoryModel, CategorySchema };
