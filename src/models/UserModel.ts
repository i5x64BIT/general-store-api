import mongoose, { Model } from "mongoose";

enum ERoles {
  admin = "admin",
  user = "user",
  supplier = "supplier",
  employee = "employee",
}

const UserSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: ERoles.user, enum: ERoles },
  phone_num: Number,
  address: String,
  date_created: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  date_updated: {
    type: Date,
    default: Date.now(),
  },
  cart: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Product'
    },
  ],
  isOnMailingList: { type: Boolean, required: true, default: false },
  receipts: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
});

const UserModel = mongoose.model("User", UserSchema);
export { UserModel, UserSchema, ERoles };
