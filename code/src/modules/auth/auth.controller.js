import { Router } from "express";
import {
  confirmEmail,
  confirmForgetPassword,
  confirmLogin,
  forgetPassword,
  login,
  loginGmail,
  resendConfirmEmail,
  resetPassword,
  signup,
  signupGmail,
} from "./auth.service.js";
import {
  confirm_email_schema,
  forget_password_schema,
  login_schema,
  signup_schema,
} from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/signup", validation(signup_schema), async (req, res, next) => {
  const result = await signup(req.body);
  return res.status(201).json({ message: "Signup completed", result });
});
router.post(
  "/confirm-email",
  validation(confirm_email_schema),
  async (req, res, next) => {
    await confirmEmail(req.body);
    return res.status(200).json({ message: "Email confirmed" });
  },
);
router.post("/resend-confirm-email", async (req, res, next) => {
  await resendConfirmEmail(req.body);
  return res.status(200).json({ message: "OTP sent. Please check your email" });
});
router.post(
  "/forget-password",
  validation(forget_password_schema),
  async (req, res, next) => {
    const result = await forgetPassword(req.body);
    return res
      .status(201)
      .json({ message: "OTP sent. Please check your email", result });
  },
);
router.post("/confirm-forget-password", async (req, res, next) => {
  const result = await confirmForgetPassword(req.body);
  return res.status(200).json({ result });
});
router.post("/reset-password", async (req, res, next) => {
  const result = await resetPassword(req.body);
  return res.status(200).json({ result });
});
router.post("/login", validation(login_schema), async (req, res, next) => {
  const result = await login(req.body);
  return res
    .status(201)
    .json({ message: "OTP sent. Please check your email", result });
});
router.post("/confirm-login", async (req, res, next) => {
  const result = await confirmLogin(req.body);
  return res.status(201).json({ message: "Login completed", result });
});
router.post("/signup/gmail", async (req, res, next) => {
  const account = await signupGmail(req.body);
  return res.status(201).json({ message: "Signup completed", account });
});
router.post("/login/gmail", async (req, res, next) => {
  const account = await loginGmail(req.body);
  return res.status(201).json({ message: "Login completed", account });
});
export default router;
