import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

export const redis =
  global.__redis ??
  new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") global.__redis = redis;
