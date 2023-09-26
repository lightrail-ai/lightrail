import workerpool from "workerpool";

let vectorizer: any = null;

async function initialize() {
  const { pipeline } = await import("@xenova/transformers");
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

workerpool.worker({
  initialize,
  vectorize,
});
