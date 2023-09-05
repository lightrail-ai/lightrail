import type { LightrailTrack } from "lightrail-sdk";

declare function require(module: string): any;

export default {
  name: "chrome",
  tokens: [
    {
      name: "current-page",
      description: "Google Chrome Current Page",
      args: [],
      color: "#f8bd13",
      render(_args) {
        return [];
      },
      async hydrate(mainHandle, args, prompt) {
        const { Readability } = await import("@mozilla/readability");
        const { parseHTML } = await import("linkedom");
        const { NodeHtmlMarkdown } = await import("node-html-markdown");

        let url, content;
        try {
          ({ url, content } = await mainHandle.sendMessageToExternalClient(
            "chrome-client",
            "get-current-page"
          ));
        } catch (e) {
          throw new Error("Chrome client failed to respond.");
        }

        if (!content) {
          prompt.appendContextItem({
            type: "text",
            title: url,
            content: "No content extracted from page",
          });
        } else {
          let { document } = parseHTML(content);

          let reader = new Readability(document);
          let article = reader.parse();
          if (article?.content) {
            const markdown = NodeHtmlMarkdown.translate(article.content);

            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown,
            });
          } else {
            const markdown = document.body.textContent;
            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown!,
            });
          }
        }

        prompt.appendText(url);
      },
    },
  ],
  actions: [],
  handlers: {
    main: {
      "chrome-client:new-page": async (handler) => {
        handler.sendMessageToRenderer("prioritize-tokens");
      },
    },
    renderer: {
      "prioritize-tokens": async (handler) => {
        handler.getTrackTokens().forEach((token) => {
          token.prioritize();
        });
      },
    },
  },
} satisfies LightrailTrack;
