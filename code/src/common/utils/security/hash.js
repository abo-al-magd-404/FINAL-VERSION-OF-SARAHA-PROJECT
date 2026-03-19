import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";

export const generateHash = async (plainText, salt = SALT_ROUND) => {
  return await hash(plainText, salt);
};

export const compareHash = async (value, hashedValue) => {
  return await compare(value, hashedValue);
};
