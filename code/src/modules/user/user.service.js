import {
  BaseRevokeTokenKey,
  deleteKey,
  findKeys,
  revokeTokenKey,
  set,
} from "../../common/services/redis.service.js";
import { decrypt } from "../../common/utils/security/encryption.js";
import { createLoginCredentials } from "../../common/utils/security/token.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.js";
import { findOne } from "../../DB/db.service.js";
import { userModel } from "../../DB/model/user.model.js";

export const profile = async (user) => {
  return user;
};

export const profileImage = async (file, user) => {
  user.profilePic = file.finalPath;
  await user.save();
  return user;
};
export const coverImage = async (file, user) => {
  user.coverPics = file.map((ele) => ele.finalPath);
  await user.save();
  return user;
};

export const logout = async ({ flag }, user, { jti, iat, sub }) => {
  let status = 200;
  switch (flag) {
    case "all":
      user.changeCredentialsTime = new Date();
      await user.save();
      await deleteKey(await findKeys(BaseRevokeTokenKey(sub)));
      break;
    case "one":
      await set({
        keyName: revokeTokenKey({ userId: sub, jti }),
        value: jti,
        ttl: 370000,
      });
      status = 201;
      break;
    default: {
      const error = new Error("Flag must be one of: one, all");
      error.cause = { status: 400 };
      throw error;
    }
  }
  return status;
};

export const shareProfile = async (userId) => {
  const user = await findOne({
    model: userModel,
    filter: { _id: userId },
    select: "-password -role ",
  });
  if (!user) {
    const error = new Error("User not found");
    error.cause = { status: 404 };
    throw error;
  }
  if (user.phone) {
    user.phone = decrypt(user.phone);
  }
  return user;
};

export const rotate = async (user, { jti, sub, iat }) => {
  if ((iat + 3 * 60 * 60) * 1000 > Date.now()) {
    const error = new Error("Current access token is still valid");
    error.cause = { status: 400 };
    throw error;
  }
  await set({
    keyName: revokeTokenKey({ userId: sub, jti }),
    value: jti,
    ttl: 37000,
  });
  return await createLoginCredentials(user);
};

export const updatePassword = async ({ newPassword, oldPassword }, user) => {
  if (!(await compareHash(oldPassword, user.password))) {
    const error = new Error("Old password is incorrect");
    error.cause = { status: 400 };
    throw error;
  }
  user.password = await generateHash(newPassword);
  user.changeCredentialsTime = new Date();
  await user.save();
  return;
};
