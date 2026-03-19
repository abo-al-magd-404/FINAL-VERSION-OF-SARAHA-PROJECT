import crypto from "crypto";
import { ENC_BYTE } from "../../../../config/config.service.js";

const algorithm = "aes-256-cbc";
if (!ENC_BYTE) {
  throw new Error("Encryption key is not configured");
}
const secretKey = Buffer.from(ENC_BYTE);
if (secretKey.length !== 32) {
  throw new Error("Encryption key must be 32 bytes");
}
const ivLength = 16;

export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encryptedData = cipher.update(text, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return iv.toString("hex") + ":" + encryptedData;
};

export const decrypt = (encryptedData) => {
  const [ivHex, encryptedText] = encryptedData.split(":");

  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(ivHex, "hex"),
  );

  let decryptedData = decipher.update(encryptedText, "hex", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
};
