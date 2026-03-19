import { userModel } from "../../DB/model/user.model.js";
import { create, findOne } from "../../DB/db.service.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.js";
import { encrypt } from "../../common/utils/security/encryption.js";
import { createLoginCredentials } from "../../common/utils/security/token.js";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enums/user.enum.js";
import { create_OTP } from "../../common/utils/email/otp.js";
import {
  deleteKey,
  get,
  set,
  simpleSet,
  ttl,
} from "../../common/services/redis.service.js";
import { emailEmitter } from "../../common/email.event.js";
import { GOOGLE_CLIENT_ID } from "../../../config/config.service.js";

export const Generate_Key_In_Redis_And_SendEmail = async ({
  keyName,
  email,
  subject,
}) => {
  const code = `${await create_OTP()}`;
  const attemptsKey = `attempts_for:${email}`;
  const attemptsValue = Number((await get({ key: attemptsKey })) || 0);
  if (attemptsValue >= 3) {
    const error = new Error(
      `Too many attempts. Try again after ${await ttl({ key: attemptsKey })} seconds`,
    );
    error.cause = { status: 429 };
    throw error;
  }
  await simpleSet({ keyName: attemptsKey, value: attemptsValue + 1, ttl: 600 });
  await set({ keyName, value: await generateHash(code), ttl: 200 });
  emailEmitter.emit("confirm_email", {
    to: email,
    subject,
    code,
  });
};
export const signup = async ({ email, password, phone, username }) => {
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email },
  });
  if (checkUserExist) {
    const error = new Error("Email already exists");
    error.cause = { status: 409 };
    throw error;
  }
  const user = await create({
    model: userModel,
    data: {
      email,
      password: await generateHash(password),
      username,
      phone: await encrypt(phone),
    },
  });
  await Generate_Key_In_Redis_And_SendEmail({
    keyName: `signup_otp:${email}`,
    email,
    subject: "SIGNUP OTP",
  });
  return user;
};
export const confirmEmail = async ({ email, otp }) => {
  const checkUserExist = await findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!checkUserExist) {
    const error = new Error("Account not found or already confirmed");
    error.cause = { status: 404 };
    throw error;
  }
  const Hashed_OTP_In_Redis = await get({ key: `signup_otp:${email}` });
  if (!Hashed_OTP_In_Redis) {
    const error = new Error("OTP expired");
    error.cause = { status: 400 };
    throw error;
  }
  if (!(await compareHash(otp, Hashed_OTP_In_Redis))) {
    const error = new Error("Invalid OTP");
    error.cause = { status: 400 };
    throw error;
  }
  checkUserExist.confirmEmail = new Date();
  await checkUserExist.save();
  await deleteKey([`signup_otp:${email}`, `attempts_for:${email}`]);
  return "Email confirmed";
};
export const resendConfirmEmail = async ({ email }) => {
  const checkUserExist = await findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!checkUserExist) {
    const error = new Error("Account not found or already confirmed");
    error.cause = { status: 404 };
    throw error;
  }
  const Hashed_OTP_In_Redis = await get({ key: `signup_otp:${email}` });
  if (Hashed_OTP_In_Redis) {
    const error = new Error(
      `You can request a new OTP after ${await ttl({ key: `signup_otp:${email}` })} seconds`,
    );
    error.cause = { status: 429 };
    throw error;
  }
  await Generate_Key_In_Redis_And_SendEmail({
    keyName: `signup_otp:${email}`,
    email,
    subject: "RESEND OTP CODE",
  });
  return;
};
export const forgetPassword = async ({ email }) => {
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!checkUserExist) {
    const error = new Error("Account not found");
    error.cause = { status: 404 };
    throw error;
  }
  const hashedOTP = await get({ key: `forgetPasswordOtp:${email}` });
  if (hashedOTP) {
    const error = new Error(
      `You can request a new OTP after ${await ttl({ key: `forgetPasswordOtp:${email}` })} seconds`,
    );
    error.cause = { status: 429 };
    throw error;
  }
  await Generate_Key_In_Redis_And_SendEmail({
    keyName: `forgetPasswordOtp:${email}`,
    email,
    subject: "FORGET PASSWORD OTP",
  });
  return "OTP sent. Please check your email";
};
export const confirmForgetPassword = async ({ email, otp }) => {
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!checkUserExist) {
    const error = new Error("Account not found");
    error.cause = { status: 404 };
    throw error;
  }
  const hashedOTP = await get({ key: `forgetPasswordOtp:${email}` });
  if (!hashedOTP) {
    const error = new Error("OTP expired");
    error.cause = { status: 400 };
    throw error;
  }
  if (!(await compareHash(otp, hashedOTP))) {
    const error = new Error("Invalid OTP");
    error.cause = { status: 400 };
    throw error;
  }
  return "confirmed";
};
export const resetPassword = async ({ email, newPassword, otp }) => {
  await confirmForgetPassword({ email, otp });
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!checkUserExist) {
    const error = new Error("Account not found");
    error.cause = { status: 404 };
    throw error;
  }
  checkUserExist.password = await generateHash(newPassword);
  checkUserExist.changeCredentialsTime = new Date();
  await checkUserExist.save();
  await deleteKey([`forgetPasswordOtp:${email}`, `attempts_for:${email}`]);
  return "Password updated successfully";
};
export const login = async ({ email, password }) => {
  const findUser = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!findUser) {
    const error = new Error("Invalid email or password");
    error.cause = { status: 401 };
    throw error;
  }
  const matchPassword = await compareHash(password, findUser.password);
  if (!matchPassword) {
    const error = new Error("Invalid email or password");
    error.cause = { status: 401 };
    throw error;
  }
  await Generate_Key_In_Redis_And_SendEmail({
    keyName: `login_otp${email}`,
    email,
    subject: "LOGIN OTP FROM OUR COMPANY",
  });
  return "OTP sent. Please check your email";
};

export const confirmLogin = async ({ email, otp }) => {
  const findUser = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!findUser) {
    const error = new Error("Account not found");
    error.cause = { status: 404 };
    throw error;
  }
  const hashedOtp = await get({ key: `login_otp${email}` });
  if (!hashedOtp) {
    const error = new Error("OTP expired");
    error.cause = { status: 400 };
    throw error;
  }
  const matchOTP = await compareHash(otp, hashedOtp);
  if (!matchOTP) {
    const error = new Error("Invalid OTP");
    error.cause = { status: 400 };
    throw error;
  }
  await deleteKey([`login_otp${email}`, `attempts_for:${email}`]);
  return await createLoginCredentials(findUser);
};

export const verifyGoogleAccount = async ({ idToken }) => {
  if (!GOOGLE_CLIENT_ID) {
    const error = new Error("Google client ID is not configured");
    error.cause = { status: 500 };
    throw error;
  }
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    const error = new Error("Google account email is not verified");
    error.cause = { status: 401 };
    throw error;
  }
  return payload;
};

export const loginGmail = async ({ idToken }) => {
  const payload = await verifyGoogleAccount({ idToken });
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email: payload.email, provider: providerEnum.google },
  });
  if (!checkUserExist) {
    const error = new Error("Invalid login credentials");
    error.cause = { status: 401 };
    throw error;
  }
  return await createLoginCredentials(checkUserExist);
};

export const signupGmail = async ({ idToken }) => {
  const payload = await verifyGoogleAccount({ idToken });
  const checkUserExist = await findOne({
    model: userModel,
    filter: { email: payload.email },
  });
  if (checkUserExist) {
    if (checkUserExist?.provider == providerEnum.system) {
      const error = new Error(
        "Email already exists. Please log in with email and password",
      );
      error.cause = { status: 409 };
      throw error;
    }
    return await loginGmail({ idToken });
  }
  const user = await create({
    model: userModel,
    data: {
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      provider: providerEnum.google,
      profilePic: payload.picture,
      confirmEmail: new Date(),
    },
  });
  return await createLoginCredentials(user);
};
