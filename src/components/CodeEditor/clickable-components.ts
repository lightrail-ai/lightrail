import { ProjectWithFiles } from "@/util/storage";
import {
  Decoration,
  MatchDecorator,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

class ComponentLinkWidget extends WidgetType {
  constructor(
    readonly componentName: string,
    readonly onClick: (name: string) => void
  ) {
    super();
    this.componentName = componentName;
    this.onClick = onClick;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.innerText = this.componentName;
    wrap.className =
      "text-sky-500 underline italic font-semibold cursor-pointer hint--right hint--rounded";
    wrap.setAttribute(
      "aria-label",
      `${navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}-Click to jump to ${
        this.componentName
      }`
    );
    wrap.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey) {
        this.onClick(this.componentName);
      }
    });
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

const componentLinkMatcher = (
  componentNames: string[] | undefined,
  onComponentClick: (name: string) => void
) =>
  new MatchDecorator({
    regexp: /(?<=\<)([A-Z]\w+)/g,
    decoration: (match) =>
      componentNames?.includes(match[1])
        ? Decoration.replace({
            widget: new ComponentLinkWidget(match[1], onComponentClick),
            inclusiveStart: true,
            inclusiveEnd: false,
          })
        : null,
  });

export const componentLinks = (
  project: ProjectWithFiles | undefined,
  onComponentClick: (name: string) => void
) => {
  const componentNames = project?.files.map((f) => f.path);
  return ViewPlugin.fromClass(
    class {
      componentLinksSet: DecorationSet;
      constructor(view: EditorView) {
        this.componentLinksSet = componentLinkMatcher(
          componentNames,
          onComponentClick
        ).createDeco(view);
      }
      update(update: ViewUpdate) {
        this.componentLinksSet = componentLinkMatcher(
          componentNames,
          onComponentClick
        ).updateDeco(update, this.componentLinksSet);
      }
    },
    {
      decorations: (instance) => instance.componentLinksSet,
    }
  );
};
