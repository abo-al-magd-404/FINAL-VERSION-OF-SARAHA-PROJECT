import mongoose from "mongoose";
import {
  GenderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enums/user.enum.js";
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    DOB: { type: Date },
    password: {
      type: String,
      minLength: 8,
      required: function () {
        return this.provider == providerEnum.system;
      },
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },
    phone: { type: String },
    confirmEmail: Date,
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    profilePic: { type: String },
    coverPics: [String],
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

userSchema.virtual("username").set(function (value) {
  const [firstName, lastName] = value.split(" ");
  this.set({ firstName: firstName, lastName: lastName });
});

export const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);
