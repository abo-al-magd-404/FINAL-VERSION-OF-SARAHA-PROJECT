import nodeMailer from "nodemailer";
import {
  EMAIL_APP,
  EMAIL_APP_PASSWORD,
} from "../../../../config/config.service.js";

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_APP,
    pass: EMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
}) => {
  await transporter.sendMail({
    from: `"SarahaApp" <${EMAIL_APP}>`,
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });
};
