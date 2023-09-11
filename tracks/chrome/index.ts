import type { LightrailTrack } from "lightrail-sdk";

const timeout = (prom, time) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]);

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
          ({ url, content } = await timeout(
            mainHandle.sendMessageToExternalClient(
              "chrome-client",
              "get-current-page"
            ),
            3000
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
    {
      name: "current-selection",
      description: "Google Chrome Current Selection",
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
          ({ url, content } = await timeout(
            mainHandle.sendMessageToExternalClient(
              "chrome-client",
              "get-current-selection"
            ),
            3000
          ));
        } catch (e) {
          throw new Error("Chrome client failed to respond.");
        }

        const title = `Current Chrome Selection (on ${url}):`;

        if (!content) {
          prompt.appendContextItem({
            type: "text",
            title,
            content: "(no content)",
          });
        } else {
          let { document } = parseHTML(`<html><body>${content}</body></html>`);

          let reader = new Readability(document);
          let article = reader.parse();
          if (article?.content) {
            const markdown = NodeHtmlMarkdown.translate(article.content);

            prompt.appendContextItem({
              type: "code",
              title,
              content: markdown,
            });
          } else {
            const content = document.body.textContent || "(no content)";
            prompt.appendContextItem({
              type: "text",
              title,
              content,
            });
          }
        }

        prompt.appendText("Current Chrome Selection");
      },
    },
  ],
  actions: [],
  handlers: {
    main: {
      "chrome-client:new-page": async (handler) => {
        handler.sendMessageToRenderer("prioritize-tokens");
      },
      "chrome-client:new-selection": async (handler) => {
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
