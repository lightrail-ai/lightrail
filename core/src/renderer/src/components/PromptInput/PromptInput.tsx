import { useEffect, useRef, useState } from "react";
import PromptEditor, {
  placeholderPlugin,
  promptSchema,
} from "../PromptEditor/PromptEditor";
import { EditorState } from "prosemirror-state";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import autocomplete, { ActionKind, FromTo } from "prosemirror-autocomplete";
import OptionsList, { Option, OptionsMode } from "../OptionsList/OptionsList";
import { useHotkeys } from "react-hotkeys-hook";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSetRecoilState } from "recoil";
import { viewAtom } from "@renderer/state";
import { rendererLightrail } from "@renderer/util/renderer-lightrail";
import type { Token, Action } from "lightrail-sdk";
import { trpcClient } from "@renderer/util/trpc-client";

const PATH_SEPARATOR = "/";

export interface PromptInputProps {
  onAction: (action: Option, prompt: object) => void;
}

function PromptInput({ onAction }: PromptInputProps) {
  const [optionsMode, setOptionsMode] = useState<OptionsMode>("actions");
  const setView = useSetRecoilState(viewAtom);
  const [options, setOptions] = useState<Option[]>(
    rendererLightrail.getActionOptions()
  );
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [optionSelected, setOptionSelected] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [currentArgIndex, setCurrentArgIndex] = useState<number | null>(null);
  const editorRangeRef = useRef<FromTo>();
  const filterValueRef = useRef<string | undefined>(undefined);
  const selectedActionName = useRef<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string | undefined>(
    undefined
  );

  function handleUpArrow() {
    setSelectedOptionIndex((prev) => prev - 1);
    return true;
  }

  function handleDownArrow() {
    setSelectedOptionIndex((prev) => prev + 1);
    return true;
  }

  function handleEnter() {
    setOptionSelected(true);
    return true;
  }

  useEffect(() => {
    if (selectedOptionIndex < 0) {
      setSelectedOptionIndex(0);
    }
    if (selectedOptionIndex > options.length - 1) {
      setSelectedOptionIndex(options.length - 1);
    }
  }, [selectedOptionIndex, options]);

  useEffect(() => {
    if (optionsMode !== "actions" && options[0]?.kind === "actions") {
      selectedActionName.current = options[selectedOptionIndex]?.name;
    }

    const currentSelection = options[selectedOptionIndex];
    if (currentSelection?.kind === "actions") {
      setSelectedAction(currentSelection);
    }
  }, [optionsMode, selectedOptionIndex, options]);

  useEffect(() => {
    switch (optionsMode) {
      case "actions":
        const actionOptions = rendererLightrail.getActionOptions();
        setOptions(actionOptions);
        setSelectedOptionIndex(
          actionOptions.findIndex(
            (option) => option.name === selectedActionName.current
          )
        );
        break;
      case "tokens":
        setOptions(rendererLightrail.getTokenOptions());
        setSelectedOptionIndex(0);
        break;
      case "token-args":
        setSelectedOptionIndex(0);
    }
  }, [optionsMode]);

  useHotkeys("up", handleUpArrow);
  useHotkeys("down", handleDownArrow);
  useHotkeys("enter", handleEnter);

  const [promptState, setPromptState] = useState<EditorState>(
    EditorState.create({
      schema: promptSchema,
      plugins: [
        ...autocomplete({
          triggers: [{ name: "token", trigger: PATH_SEPARATOR }],
          reducer: (action) => {
            switch (action.kind) {
              case ActionKind.open:
                setOptionsMode("tokens");
                return true;
              case ActionKind.close:
                setOptionsMode("actions");
                setCurrentToken(null);
                setCurrentArgIndex(null);
                return true;
              case ActionKind.filter:
                editorRangeRef.current = action.range;
                setCurrentFilter(action.filter);
                return true;
              case ActionKind.enter:
                editorRangeRef.current = action.range;
                setOptionSelected(true);
                return true;
              default:
                return false;
            }
          },
        }),
        history(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          ArrowUp: handleUpArrow,
          ArrowDown: handleDownArrow,
          Enter: handleEnter,
        }),
        keymap(baseKeymap),
        placeholderPlugin("Enter a prompt..."),
      ],
    })
  );

  useEffect(() => {
    if (optionSelected) {
      setOptionSelected(false);
      const selectedOption = options[selectedOptionIndex];
      if (optionsMode === "actions" && selectedOption.name) {
        onAction(selectedOption, promptState.doc.toJSON());
        setPromptState((oldState) =>
          oldState.apply(
            oldState.tr.insertText("", 0, oldState.doc.content.size)
          )
        );
      } else if (selectedOption.kind === "token-args") {
        if (
          currentArgIndex !== null &&
          currentToken &&
          currentToken.args[currentArgIndex]?.type === "path"
        ) {
          setPromptState((oldState) => {
            const offset = currentFilter?.lastIndexOf(PATH_SEPARATOR);
            if (offset) {
              return oldState.apply(
                oldState.tr.insertText(
                  selectedOption.value.isDirectory
                    ? selectedOption.value.name + PATH_SEPARATOR
                    : selectedOption.value.name + " ",
                  editorRangeRef.current!.from + offset + 2,
                  editorRangeRef.current!.to
                )
              );
            } else {
              // TODO: handle other types of token-args beyond path
              return oldState;
            }
          });
        }
      } else if (selectedOption.kind === "tokens" && editorRangeRef.current) {
        setCurrentToken(selectedOption);
        setOptionsMode("token-args");
        setCurrentArgIndex(-1);
        setPromptState((oldState) =>
          oldState.apply(
            oldState.tr.insertText(
              PATH_SEPARATOR + selectedOption.name + " ",
              editorRangeRef.current!.from,
              editorRangeRef.current!.to
            )
          )
        );
      }
    }
  }, [
    optionSelected,
    options,
    selectedOptionIndex,
    optionsMode,
    onAction,
    currentToken,
    currentFilter,
  ]);

  useEffect(() => {
    if (
      currentFilter &&
      currentToken &&
      currentArgIndex !== null &&
      currentArgIndex >= currentToken.args.length
    ) {
      const [tokenName, ...tokenArgs] = currentFilter?.split(/\s+/);
      let tokenType = promptSchema.nodes.token;
      let node = tokenType.create({
        name: tokenName,
        args: tokenArgs,
      });
      setPromptState((oldState) =>
        oldState.apply(
          oldState.tr.replaceRangeWith(
            editorRangeRef.current!.from,
            editorRangeRef.current!.to,
            node
          )
        )
      );
    }
  }, [currentToken, currentArgIndex, currentFilter]);

  useEffect(() => {
    if (filterValueRef.current !== currentFilter) {
      if (currentArgIndex !== null && currentFilter?.endsWith(" ")) {
        const newIndex =
          currentFilter.split(/\s+/).filter((s) => s !== "").length - 1;
        console.log(newIndex);
        setCurrentArgIndex(newIndex);
      } else if (
        currentArgIndex !== null &&
        currentToken?.args[currentArgIndex]?.type === "path"
      ) {
        const path = currentFilter?.split(/\s+/).pop();
        if (path?.endsWith(PATH_SEPARATOR)) {
          trpcClient.files.list.query(path).then((files) => {
            setOptions(
              files.map((file) => ({
                name: ".../" + file.name,
                value: file,
                kind: "token-args",
                description: "",
              }))
            );
          });
        } else {
          const fileName = path?.split(PATH_SEPARATOR).pop();
          if (fileName) {
            setOptions((options) =>
              options.filter(
                (option) =>
                  option.kind === "token-args" &&
                  option.value.name.startsWith(fileName)
              )
            );
          }
        }
      }
    }
    filterValueRef.current = currentFilter;
  }, [currentArgIndex, currentToken, currentFilter]);

  return (
    <div className="min-w-[600px]">
      <div className="relative">
        <button
          className="absolute right-1 top-1 opacity-50 hover:opacity-100"
          onClick={() => setView("settings")}
        >
          <FontAwesomeIcon icon={faGear} size={"xs"} />
        </button>
        <div className="p-4">
          <PromptEditor onChange={setPromptState} state={promptState} />
        </div>
      </div>
      {selectedAction && (
        <div
          className="text-xs px-1 py-0.5 font-light flex flex-row items-center transition-colors border-y"
          style={{
            backgroundColor: selectedAction.colors[0] + "20",
            borderColor: selectedAction.colors[0] + "50",
          }}
        >
          {selectedAction.name}
          <div className="flex-1" />
          <div className="opacity-50 italic">Press '@' to filter actions</div>
        </div>
      )}
      <OptionsList
        currentToken={currentToken}
        options={options}
        mode={optionsMode}
        selectedIndex={selectedOptionIndex}
      />
    </div>
  );
}

export default PromptInput;
