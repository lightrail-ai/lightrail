var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var files_exports = {};
__export(files_exports, {
  default: () => files_default
});
module.exports = __toCommonJS(files_exports);
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
        const fs = require("fs");
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
