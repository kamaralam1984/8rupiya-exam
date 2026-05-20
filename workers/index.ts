import { Worker, type Job } from "bullmq";
import { redis } from "../lib/redis";
import { QUEUE_NAMES } from "../lib/queue";
import { runPdfIngest } from "./pdf-ingest.worker";
import { runPredict } from "./predict.worker";

const connection = { connection: redis };

const workers = [
  new Worker(
    QUEUE_NAMES.PDF_INGEST,
    async (job: Job) => runPdfIngest(job.data),
    { ...connection, concurrency: 1 }
  ),
  new Worker(
    QUEUE_NAMES.PREDICT,
    async (job: Job) => runPredict(job.data),
    { ...connection, concurrency: 4 }
  ),
];

for (const w of workers) {
  w.on("completed", (job) => console.log(`[worker] ${w.name} done`, job.id));
  w.on("failed", (job, err) => console.error(`[worker] ${w.name} failed`, job?.id, err?.message));
  console.log(`[worker] started: ${w.name}`);
}

const shutdown = async () => {
  console.log("[worker] shutting down...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
