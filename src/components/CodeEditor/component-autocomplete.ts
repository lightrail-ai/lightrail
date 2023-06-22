import { ProjectWithFiles } from "@/util/storage";
import {
  autocompletion,
  CompletionContext,
  CompletionSource,
  Completion,
} from "@codemirror/autocomplete";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import { syntaxTree } from "@codemirror/language";
import { HTML_TAGS, TAILWIND_CLASSES } from "./autocomplete-data";
import { SyntaxNode } from "@lezer/common";

const TAILWIND_COMPLETIONS = TAILWIND_CLASSES.map((className) => ({
  label: className,
  type: "class",
}));

function projectCompletions(
  project: ProjectWithFiles | undefined,
  onCreateComponent: (name: string, callback: ComponentCreationCallback) => void
): CompletionSource {
  return (context: CompletionContext) => {
    // Component Name autocomplete:

    let word = context.matchBefore(/<\w*/);
    let isCapitalized = !!context.matchBefore(/<[A-Z]{1}\w*/);
    if (word && (word.from != word.to || context.explicit)) {
      const components = project?.files ?? [];
      let completions: Completion[] =
        isCapitalized || word.text === "<"
          ? [
              {
                label: word.text.substring(1),
                boost: word.text === "<" ? 99 : undefined,
                detail: "(Create New Component...)",
                apply(view, completion, from, to) {
                  onCreateComponent(
                    word?.text.substring(1) ?? "",
                    (name, props, file) => {
                      console.log(file);
                      view.dispatch({
                        changes: {
                          from: from - 1,
                          to,
                          insert: file?.example
                            ? file.example
                            : `<${name} ${props
                                .map((p) => `${p}={undefined}`)
                                .join(" ")} />`,
                        },
                      });
                    }
                  );
                },
              },
            ]
          : [];

      completions = completions.concat(
        components.map((file) => ({
          label: file.path,
          apply: file.example ? file.example.substring(1) : undefined,
          boost: 1,
        }))
      );
      completions = completions.concat(
        HTML_TAGS.map((tag) => ({
          label: tag,
        }))
      );

      return {
        from: word.from + 1,
        options: completions,
      };
    }

    // Tailwind autocomplete:

    let curr: SyntaxNode | null = syntaxTree(context.state).resolveInner(
      context.pos
    );

    while (curr) {
      if (curr.name === "JSXAttribute") {
        break;
      }
      curr = curr.parent;
    }

    if (curr) {
      word = context.matchBefore(/[a-z0-9-]*/);
      const nodeText = context.state.doc.sliceString(curr.from, curr.to);
      if (
        nodeText.startsWith("className") &&
        context.pos - curr.from > 10 &&
        word &&
        (word.from != word.to || context.explicit)
      ) {
        return {
          from: word.from,
          options: TAILWIND_COMPLETIONS,
        };
      }
    }

    return null;
  };
}

export const componentAutocompletion = (
  project: ProjectWithFiles | undefined,
  onCreateComponent: (name: string, callback: ComponentCreationCallback) => void
) =>
  autocompletion({
    override: [projectCompletions(project, onCreateComponent)],
  });
