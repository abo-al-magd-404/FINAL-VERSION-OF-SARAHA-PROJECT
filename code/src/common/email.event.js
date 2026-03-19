import { EventEmitter } from "events";
import { sendEmail } from "./utils/email/send.email.js";

export const emailEmitter = new EventEmitter();
emailEmitter.on("confirm_email", async ({ to, subject, code, title }) => {
  try {
    await sendEmail({
      to,
      subject,
      html: `<h1>OTP code is ${code} </h1>`,
    });
  } catch (error) {}
});
