import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const lightrail = this.lightrail;

    const handle = lightrail.registerToken({
      name: "chrome-current-page",
      description: "Google Chrome Current Page",
      args: [],
      color: "#f8bd13",
      async handler(args, prompt) {
        const TurndownService = require("turndown");
        const { Readability } = require("@mozilla/readability");
        const { JSDOM } = require("jsdom");

        const turndownService = new TurndownService();

        const { url, content } = await lightrail.sendEvent(
          {
            name: "chrome:get-current-page",
            data: {},
          },
          "chrome-client"
        );

        if (!content) {
          prompt.appendContextItem({
            type: "text",
            title: url,
            content: "No content extracted from page",
          });
        } else {
          var doc = new JSDOM(content, {
            url: url,
          });
          let reader = new Readability(doc.window.document);
          let article = reader.parse();
          if (article.content) {
            const markdown = turndownService.turndown(article.content);

            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown,
            });
          } else {
            const markdown = doc.window.document.body.textContent;
            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown,
            });
          }
        }

        prompt.appendText(url);

        return prompt;
      },
      renderer(_args) {
        return "chrome-current-page";
      },
    });

    if (lightrail.isRenderer) {
      lightrail.registerEventListener("chrome:new-page", async () => {
        handle?.prioritize();
      });

      lightrail.registerEventListener(
        "lightrail:client-disconnected",
        async ({ data }) => {
          if (data.name === "chrome-client") {
            handle?.disable();
          }
        }
      );
      lightrail.registerEventListener(
        "lightrail:client-connected",
        async ({ data }) => {
          if (data.name === "chrome-client") {
            handle?.enable();
          }
        }
      );
    }
  }
}
