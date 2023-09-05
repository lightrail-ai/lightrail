import { LightrailTrack } from "lightrail-sdk";

declare function require(module: string): any;

export default {
  name: "files", // Everything except name is optional
  tokens: [
    {
      name: "contents",
      description: "Access contents of a file",
      args: [
        {
          name: "path",
          description: "Path to file",
          type: "path",
        },
      ],
      color: "#54aeff",
      async hydrate(handle, args, prompt) {
        const fs = require("fs");
        // read file contents
        const data = fs.readFileSync(args.path, "utf8");
        prompt.appendContextItem({
          type: "code",
          title: args.path,
          content: data,
        });
        prompt.appendText(args.path);
      },
      render(args) {
        const parts = args.path.split("/");
        let last = parts.pop();
        if (last === "") {
          last = parts.pop();
        }

        return last ? [last] : [args.path];
      },
    },
    {
      name: "path",
      description: "Enter the path of a file",
      args: [
        {
          name: "path",
          description: "Path to file",
          type: "path",
        },
      ],
      color: "#54aeff",
      async hydrate(handle, args, prompt) {
        prompt.appendText(args.path);
      },
      render(args) {
        const parts = args.path.split("/");
        let last = parts.pop();
        if (last === "") {
          last = parts.pop();
        }

        return last ? [last] : [args.path];
      },
    },
  ],
  actions: [],
  handlers: {
    main: {},
    renderer: {},
  },
} satisfies LightrailTrack;
