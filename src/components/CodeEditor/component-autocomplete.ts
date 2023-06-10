import { ProjectWithFiles } from "@/util/storage";
import {
  autocompletion,
  CompletionContext,
  CompletionSource,
  Completion,
} from "@codemirror/autocomplete";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

let htmlTags = [
  "html",
  "base",
  "head",
  "link",
  "meta",
  "script",
  "style",
  "title",
  "body",
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hgroup",
  "main",
  "nav",
  "section",
  "blockquote",
  "cite",
  "dd",
  "dt",
  "dl",
  "div",
  "figcaption",
  "figure",
  "hr",
  "li",
  "ol",
  "ul",
  "menu",
  "p",
  "pre",
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rp",
  "ruby",
  "rt",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
  "area",
  "audio",
  "img",
  "map",
  "track",
  "video",
  "embed",
  "iframe",
  "object",
  "picture",
  "source",
  "portal",
  "svg",
  "canvas",
  "noscript",
  "del",
  "ins",
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "tr",
  "td",
  "tfoot",
  "th",
  "thead",
  "button",
  "datalist",
  "option",
  "fieldset",
  "label",
  "form",
  "input",
  "legend",
  "meter",
  "optgroup",
  "select",
  "output",
  "progress",
  "textarea",
  "details",
  "summary",
  "dialog",
  "slot",
  "template",
  "acronym",
  "applet",
  "bgsound",
  "big",
  "blink",
  "center",
  "dir",
  "font",
  "frame",
  "frameset",
  "image",
  "keygen",
  "marquee",
  "menuitem",
  "nobr",
  "noembed",
  "noframes",
  "param",
  "plaintext",
  "rb",
  "rtc",
  "spacer",
  "strike",
  "tt",
  "xmp",
];

function projectCompletions(
  project: ProjectWithFiles | undefined,
  onCreateComponent: (name: string, callback: ComponentCreationCallback) => void
): CompletionSource {
  return (context: CompletionContext) => {
    let word = context.matchBefore(/<\w*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    const components = project?.files?.map((file) => file.path) ?? [];
    let completions: Completion[] = [
      {
        label: word.text.substring(1),
        detail: "(Create New Component...)",
        apply(view, completion, from, to) {
          onCreateComponent(word?.text.substring(1) ?? "", (name, props) => {
            view.dispatch({
              changes: {
                from,
                to,
                insert: `${name} ${props
                  .map((p) => `${p}={undefined}`)
                  .join(" ")} />`,
              },
            });
          });
        },
      },
    ];

    completions = completions.concat(
      components.map((name) => ({
        label: name,
        boost: 1,
      }))
    );
    completions = completions.concat(
      htmlTags.map((tag) => ({
        label: tag,
      }))
    );

    return {
      from: word.from + 1,
      options: completions,
    };
  };
}

export const componentAutocompletion = (
  project: ProjectWithFiles | undefined,
  onCreateComponent: (name: string, callback: ComponentCreationCallback) => void
) =>
  autocompletion({
    override: [projectCompletions(project, onCreateComponent)],
  });
