import { pipeline } from "@xenova/transformers";

let vectorizer: any = null;

async function initialize() {
  vectorizer = await pipeline("feature-extraction", "thenlper/gte-base", {
    quantized: false,
  });
  return true;
}

async function vectorize(
  content: string | string[]
): Promise<(number | number[])[]> {
  const tensor = await vectorizer?.(content, {
    pooling: "mean",
    normalize: true,
  });
  return tensor.tolist();
}

(window as any).initialize = initialize;
(window as any).vectorize = vectorize;
