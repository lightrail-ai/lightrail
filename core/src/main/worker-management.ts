import { join } from "path";
import log from "./logger";
import workerpool from "workerpool";

let pool;

async function getWorker() {
  if (!pool) {
    pool = workerpool.pool(join(__dirname, "vectorizer.js"));
    const initialized = await pool.exec("initialize");
    if (!initialized) {
      throw new Error("Failed to initialize vectorizer worker");
    } else {
      log.info("Initialized vectorizer worker");
    }
  }
  return pool;
}

export async function getVectorizer() {
  const worker = await getWorker();
  return {
    vectorize: async (content: string[]) => {
      return await worker.exec("vectorize", [content]);
    },
  };
}
