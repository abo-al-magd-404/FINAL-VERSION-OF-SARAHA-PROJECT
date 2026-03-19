import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: {
      type: String,
      minLength: 2,
      maxLength: 10000,
      required: function () {
        if (!this.attachments) {
          return true;
        }
        if (this.attachments.length === 0) {
          return true;
        }
        return false;
      },
    },
    attachments: { type: [String] },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
  },
);

export const messageModel =
  mongoose.models.message || mongoose.model("message", messageSchema);
