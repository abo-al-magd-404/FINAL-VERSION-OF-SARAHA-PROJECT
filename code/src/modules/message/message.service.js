import { create, deleteOne, find, findOne } from "../../DB/db.service.js";
import { messageModel } from "../../DB/model/message.model.js";
import { userModel } from "../../DB/model/user.model.js";

export const sendMessage = async (receiverId, files = [], { content }) => {
  const checkReceiverExist = await findOne({
    model: userModel,
    filter: { _id: receiverId, confirmEmail: { $exists: true } },
  });
  if (!checkReceiverExist) {
    const error = new Error("Receiver not found");
    error.cause = { status: 404 };
    throw error;
  }
  const message = await create({
    model: messageModel,
    data: {
      content,
      attachments: files.map((ele) => ele.finalPath),
      receiverId,
    },
  });
  return message;
};

export const sendMessageWithSender = async (
  receiverId,
  files = [],
  { content },
  user,
) => {
  const checkReceiverExist = await findOne({
    model: userModel,
    filter: { _id: receiverId, confirmEmail: { $exists: true } },
  });
  if (!checkReceiverExist) {
    const error = new Error("Receiver not found");
    error.cause = { status: 404 };
    throw error;
  }
  const message = await create({
    model: messageModel,
    data: {
      content,
      attachments: files.map((ele) => ele.finalPath),
      receiverId,
      senderId: user._id,
    },
  });
  return message;
};

export const getMessage = async (messageId, user) => {
  const message = await findOne({
    model: messageModel,
    filter: {
      _id: messageId,
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    },
    select: "-senderId",
  });
  if (!message) {
    const error = new Error("Message not found");
    error.cause = { status: 404 };
    throw error;
  }
  return message;
};
export const deleteMessageById = async (messageId, user) => {
  const message = await deleteOne({
    model: messageModel,
    filter: { _id: messageId, receiverId: user._id },
  });
  if (!message.deletedCount) {
    const error = new Error("Message not found");
    error.cause = { status: 404 };
    throw error;
  }
  return message;
};
export const myMessages = async (user) => {
  const messages = await find({
    model: messageModel,
    filter: { receiverId: user._id },
  });
  return messages;
};
export const messages_i_send = async (user) => {
  const messages = await find({
    model: messageModel,
    filter: { senderId: user._id },
  });
  return messages;
};
