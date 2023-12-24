import mongoose from "mongoose";
import { format } from "date-format-parse";

/**
 *
 * @returns Formatted current time
 */
const timeStamp = () => {
  return format(new Date(), "DD.MM.YY HH:mm");
};

const dbConnection = {
  connect: async () => {
    try {
      await mongoose.connect(process.env.CONNECTION_STRING);
      console.log("Connected to DB", timeStamp());
      return { ok: true };
    } catch (error) {
      return { error };
    }
  },
  disconnect: async () => {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from DB", timeStamp());
      return { ok: true };
    } catch (error) {
      return { error };
    }
  },
};

export default dbConnection;
