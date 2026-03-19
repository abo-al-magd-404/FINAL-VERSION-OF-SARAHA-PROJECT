import { NODE_ENV, port } from "../config/config.service.js";
import { checkConnection } from "./DB/connection.db.js";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import express from "express";
import cors from "cors";
import { resolve } from "node:path";
import { redisClient, redisConnection } from "./DB/redis.connection.js";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

async function bootstrap() {
  const app = express();
  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    skipFailedRequests: true,
    limit: async function (req) {
      return 10;
    },
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip, 56);
      return `${ip}-${req.path}`;
    },
    store: {
      async increment(key) {
        const count = await redisClient.incr(key);
        if (count === 1) await redisClient.expire(key, 120);
        const seconds = await redisClient.ttl(key);
        const resetTime = new Date(Date.now() + Math.max(seconds, 0) * 1000);
        return { totalHits: count, resetTime };
      },
      async decrement(key) {
        await redisClient.decr(key);
      },
      async resetKey(key) {
        await redisClient.del(key);
      },
    },
  });
  app.set("trust proxy", true);
  app.use(cors(), helmet(), limiter, express.json());
  await checkConnection();
  await redisConnection();
  app.get("/", (req, res) => {
    return res.send("Hello World!");
  });
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.use("/uploads", express.static(resolve(process.cwd(), "uploads")));

  app.use((req, res) => {
    return res.status(404).json({ message: "Invalid route" });
  });

  app.use((error, req, res, next) => {
    const status = error.cause?.status ?? 500;
    return res.status(status).json({
      message:
        status === 500
          ? "Something went wrong"
          : (error.message ?? "Something went wrong"),

      details: error.cause?.details,

      stack: NODE_ENV === "development" ? error.stack : undefined,
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
export default bootstrap;
