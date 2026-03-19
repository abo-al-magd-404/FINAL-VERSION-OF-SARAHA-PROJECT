import { redisClient } from "../../DB/redis.connection.js";

export const revokeTokenKey = ({ userId, jti }) => {
  return `userBlocked::${userId}::jti::${jti}`;
};
export const BaseRevokeTokenKey = (userId) => {
  return `userBlocked::${userId}`;
};

export const set = async ({ keyName, value, ttl } = {}) => {
  let data = typeof value === "string" ? value : JSON.stringify(value);
  return ttl
    ? await redisClient.set(keyName, data, { EX: ttl })
    : await redisClient.set(keyName, data);
};
export const update = async ({ key, value, ttl } = {}) => {
  if (!(await redisClient.exists(key))) {
    return 0;
  }
  return await set({ keyName: key, value, ttl });
};
export const simpleSet = async ({ keyName, value, ttl } = {}) => {
  return await set({ keyName, value, ttl });
};
export const get = async ({ key }) => {
  try {
    return JSON.parse(await redisClient.get(key));
  } catch (error) {
    return await redisClient.get(key);
  }
};
export const ttl = async ({ key }) => {
  return await redisClient.ttl(key);
};
export const exists = async ({ key }) => {
  return await redisClient.exists(key);
};
export const expire = async ({ key, ttl } = {}) => {
  return await redisClient.expire(key, ttl);
};
export const mGet = async (keys = []) => {
  if (!keys.length) {
    return 0;
  }
  return await redisClient.mGet(keys);
};
export const findKeys = async (prefix) => {
  return await redisClient.keys(`${prefix}*`);
};
export const deleteKey = async (keys = []) => {
  if (!keys.length) {
    return 0;
  }
  return await redisClient.del(keys);
};
