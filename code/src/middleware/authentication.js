import { tokenTypeEnum } from "../common/enums/user.enum.js";
import { decodeToken_And_FindUser } from "../common/utils/security/token.js";

export const auth = (tokenType = tokenTypeEnum.access) => {
  return async (req, res, next) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        const error = new Error("Authorization token is required");
        error.cause = { status: 401 };
        throw error;
      }
      const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : authorization.trim();
      if (!token) {
        const error = new Error("Authorization token is required");
        error.cause = { status: 401 };
        throw error;
      }
      const { user, decoded } = await decodeToken_And_FindUser({
        token,
        tokenType_AccessOrRefresh: tokenType,
      });
      req.user = user;
      req.decoded = decoded;
      next();
    } catch (error) {
      if (!error.cause) {
        error.cause = { status: 401 };
      }
      return next(error);
    }
  };
};
export const authorization = (accessRole) => {
  return async (req, res, next) => {
    if (accessRole !== req.user.role) {
      const error = new Error("Access denied");
      error.cause = { status: 403 };
      throw error;
    }
    next();
  };
};
