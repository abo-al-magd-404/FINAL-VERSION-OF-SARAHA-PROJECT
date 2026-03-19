import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { userModel } from "./model/user.model.js";

export const checkConnection = async () => {
  try {
    await mongoose.connect(DB_URI);
    await userModel.syncIndexes();
    console.log("db connected successfully");
  } catch (error) {
    throw error;
  }
};
