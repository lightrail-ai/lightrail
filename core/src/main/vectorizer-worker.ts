const workerpool = require("workerpool");
const { pipeline } = require("@xenova/transformers");
let vectorizer = null;

async function initialize() {
  vectorizer = await pipeline("feature-extraction", "thenlper/gte-base", {
    quantized: false,
  });
  return true;
}
