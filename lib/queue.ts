import { Queue, QueueEvents, type JobsOptions } from "bullmq";
import { redis } from "./redis";

export const QUEUE_NAMES = {
  PDF_INGEST: "pdf-ingest",
  AI_GENERATE: "ai-generate",
  PREDICT: "predict",
  WEAKNESS: "weakness",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const connection = { connection: redis };

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, connection);
    queues.set(name, q);
  }
  return q;
}

export const defaultJobOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { count: 200, age: 60 * 60 * 24 },
  removeOnFail: { count: 1000, age: 60 * 60 * 24 * 7 },
};

export function getEvents(name: QueueName) {
  return new QueueEvents(name, connection);
}
