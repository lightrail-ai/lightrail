var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// index.ts
var files_default = {
  name: "files",
  // Everything except name is optional
  tokens: [
    {
      name: "contents",
      description: "Access contents of a file",
      args: [
        {
          name: "path",
          description: "Path to file",
          type: "path"
        }
      ],
      color: "#54aeff",
      async hydrate(handle, args, prompt) {
        const fs = __require("fs");
        const data = fs.readFileSync(args.path, "utf8");
        prompt.appendContextItem({
          type: "code",
          title: args.path,
          content: data
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
      }
    },
    {
      name: "path",
      description: "Enter the path of a file",
      args: [
        {
          name: "path",
          description: "Path to file",
          type: "path"
        }
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
      }
    }
  ],
  actions: [],
  handlers: {
    main: {},
    renderer: {}
  }
};
export {
  files_default as default
};
