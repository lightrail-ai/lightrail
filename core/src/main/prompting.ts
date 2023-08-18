import { Prompt } from "lightrail-sdk";
import { MainLightrail } from "./main-lightrail";

export async function constructPrompt(
  promptJson: object,
  mainLightrail: MainLightrail
): Promise<Prompt> {
  const nodes = promptJson["content"];
  let prompt = new Prompt();

  for (const node of nodes) {
    if (node.type === "text") {
      prompt.appendText(node.text);
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

export function stringifyPrompt(prompt: Prompt): string {
  let output =
    prompt._context.length > 0
      ? "Use the following context to help you respond. Each context item is delimited by the string '======' and starts with the item's title or identifier (i.e a filename, url, etc) as the first line (in backticks):\n\n"
      : "";
  for (const contextItem of prompt._context) {
    output += "======\n";
    switch (contextItem.type) {
      case "code":
        output += "`" + contextItem.title + "`\n\n";
        output += "```\n" + contextItem.content + "\n```";
        break;
      case "text":
        output += "`" + contextItem.title + "`\n\n";
        output += contextItem.content;
    }
    output += "\n======\n\n";
  }
  if (prompt._context.length > 0) {
    output += "Use the above context to respond to the following prompt:\n\n";
  }

  output += prompt._body;

  return output;
}
