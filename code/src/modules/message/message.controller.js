import { Router } from "express";
import {
  deleteMessageById,
  getMessage,
  messages_i_send,
  myMessages,
  sendMessage,
  sendMessageWithSender,
} from "./message.service.js";
import { localFileUpload } from "../../common/utils/multer/local.multer.js";
import { allowedFiles } from "../../common/utils/multer/validation.multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import { message_schema } from "./message.validation.js";
import { auth } from "../../middleware/authentication.js";
const router = Router({ caseSensitive: true, strict: true, mergeParams: true });

router.post(
  "/send-message/:receiverId",
  localFileUpload({
    customPath: "messages",
    validation: allowedFiles.image,
  }).array("attachments", 2),
  validation(message_schema),
  async (req, res, next) => {
    const result = await sendMessage(
      req.params.receiverId,
      req.files,
      req.body,
    );
    return res.status(201).json({ message: "Message sent", result });
  },
);

router.post(
  "/send-message/:receiverId/by-user",
  auth(),
  localFileUpload({
    customPath: "messages",
    validation: allowedFiles.image,
  }).array("attachments", 2),
  validation(message_schema),
  async (req, res, next) => {
    const result = await sendMessageWithSender(
      req.params.receiverId,
      req.files,
      req.body,
      req.user,
    );
    return res.status(201).json({ message: "Message sent", result });
  },
);

router.get("/get-message/:id", auth(), async (req, res, next) => {
  const result = await getMessage(req.params.id, req.user);
  return res.status(200).json({ message: "Done", result });
});
router.delete("/delete-message/:id", auth(), async (req, res, next) => {
  const result = await deleteMessageById(req.params.id, req.user);
  return res.status(200).json({ message: "Message deleted", result });
});
router.get("/my-messages", auth(), async (req, res, next) => {
  const result = await myMessages(req.user);
  return res.status(200).json({ message: "Done", result });
});
router.get("/messages-i-send", auth(), async (req, res, next) => {
  const result = await messages_i_send(req.user);
  return res.status(200).json({ message: "Done", result });
});

export default router;
