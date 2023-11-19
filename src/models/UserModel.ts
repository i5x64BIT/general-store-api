import mongoose from "mongoose";

enum ERoles {
  admin = "admin",
  user = "user",
  supplier = "supplier",
  employee = "employee",
}
interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: ERoles;
  phone_num?: string;
  address?: string;
  cart: mongoose.Types.ObjectId;
  isOnMailingList: boolean;
  receipts: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: ERoles.user, enum: ERoles },
  phone_num: String,
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
      ref: "Product",
    },
  ],
  isOnMailingList: { type: Boolean, required: true, default: false },
  receipts: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
});

const UserModel = mongoose.model<IUser>("User", UserSchema);
export { UserModel, IUser, ERoles };
