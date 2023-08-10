import { MainLightrail } from "./main-lightrail";

export async function stringifyPrompt(
  promptJson: object,
  mainLightrail: MainLightrail
): Promise<string> {
  const nodes = promptJson["content"];
  let prompt = "";
  for (const node of nodes) {
    if (node.type === "text") {
      prompt += node.text;
    } else if (node.type === "token") {
      const token = mainLightrail.tokens.get(node.attrs.name);
      if (!token) {
        throw new Error(`Unknown token: ${node.token}`);
      }
      prompt = await token.handler(node.attrs.args, prompt);
    }
  }
  return prompt;
}
