import jwt from "jsonwebtoken";
import {
  ADMIN_ACCESS_SECRET_KEY,
  ADMIN_REFRESH_SECRET_KEY,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  USER_ACCESS_SECRET_KEY,
  USER_REFRESH_SECRET_KEY,
} from "../../../../config/config.service.js";
import {
  providerEnum,
  roleEnum,
  tokenTypeEnum,
} from "../../enums/user.enum.js";
import { findOne } from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/user.model.js";
import { randomUUID } from "node:crypto";
import { get, revokeTokenKey } from "../../services/redis.service.js";
export const generateToken = ({ payload = {}, secret, options = {} } = {}) =>
  jwt.sign(payload, secret, options);

export const verifyToken = ({ token, secret } = {}) =>
  jwt.verify(token, secret);

export const getTokenSecret = async (role) => {
  let accessSignature;
  let refreshSignature;
  switch (role) {
    case roleEnum.Admin:
      accessSignature = ADMIN_ACCESS_SECRET_KEY;
      refreshSignature = ADMIN_REFRESH_SECRET_KEY;
      break;
    default:
      accessSignature = USER_ACCESS_SECRET_KEY;
      refreshSignature = USER_REFRESH_SECRET_KEY;
      break;
  }
  return { accessSignature, refreshSignature };
};

export const createLoginCredentials = async (foundUser) => {
  const { accessSignature, refreshSignature } = await getTokenSecret(
    foundUser.role,
  );
  const jwtid = randomUUID();
  const access_token = generateToken({
    payload: {
      sub: foundUser._id,
      role: foundUser.role,
      aud: [tokenTypeEnum.access, providerEnum.system],
      jti: jwtid,
    },
    secret: accessSignature,
    options: { expiresIn: ACCESS_EXPIRES_IN ?? "3h" },
  });
  const refresh_token = generateToken({
    payload: {
      sub: foundUser._id,
      role: foundUser.role,
      aud: [tokenTypeEnum.refresh, providerEnum.system],
      jti: jwtid,
    },
    secret: refreshSignature,
    options: { expiresIn: REFRESH_EXPIRES_IN ?? "1y" },
  });
  return { access_token, refresh_token };
};
export const decodeToken_And_FindUser = async ({
  token,
  tokenType_AccessOrRefresh = tokenTypeEnum.access,
}) => {
  const tokenSecrets = [
    await getTokenSecret(roleEnum.user),
    await getTokenSecret(roleEnum.Admin),
  ];

  let verified;
  for (const secrets of tokenSecrets) {
    try {
      verified = verifyToken({
        token,
        secret:
          tokenType_AccessOrRefresh === tokenTypeEnum.refresh
            ? secrets.refreshSignature
            : secrets.accessSignature,
      });
      break;
    } catch (error) {}
  }

  if (!verified?.aud) {
    throw new Error("Invalid token");
  }

  const [verifiedTokenType] = verified.aud;
  if (verifiedTokenType !== tokenType_AccessOrRefresh) {
    throw new Error(
      `Invalid token type: expected ${tokenType_AccessOrRefresh}`,
    );
  }

  if (
    verified.jti &&
    (await get({
      key: revokeTokenKey({ userId: verified.sub, jti: verified.jti }),
    }))
  ) {
    throw new Error("This token has been revoked");
  }

  const user = await findOne({
    model: userModel,
    filter: { _id: verified.sub },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (
    user.changeCredentialsTime &&
    verified?.iat &&
    user.changeCredentialsTime.getTime() >= verified.iat * 1000
  ) {
    throw new Error("This token is no longer valid");
  }
  return { user, decoded: verified };
};
