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
import type {
  Token,
  Action,
  TokenArgument,
  TokenArgumentOption,
} from "lightrail-sdk";
import { trpcClient } from "@renderer/util/trpc-client";
import { useStateWithRef } from "@renderer/util/custom-hooks";
import { EditorView } from "prosemirror-view";

const PATH_SEPARATOR = "/";

export interface PromptInputProps {
  onAction: (action: Option, prompt: object) => void;
}

function PromptInput({ onAction }: PromptInputProps) {
  const setView = useSetRecoilState(viewAtom);

  const [optionsMode, setOptionsMode, optionsModeRef] =
    useStateWithRef<OptionsMode>("actions"); // TODO: can possibly refactor this out
  const [options, setOptions, optionsRef] = useStateWithRef<Option[]>([]);
  const [highlightedOption, setHighlightedOption, highlightedOptionRef] =
    useStateWithRef<Option | undefined>(undefined);
  const [currentToken, setCurrentToken] = useState<Token | undefined>(
    undefined
  );
  const [currentAction, setCurrentAction, currentActionRef] = useStateWithRef<
    Action | undefined
  >(undefined);
  const [currentFilter, setCurrentFilter, currentFilterRef] = useStateWithRef<
    string | undefined
  >(undefined);
  const editorRangeRef = useRef<FromTo>();
  const [isFilteringActions, setIsFilteringActions] = useState(false);
  const [actionsFilter, setActionsFilter] = useState("");

  const [promptState, setPromptState, promptStateRef] =
    useStateWithRef<EditorState>(getEmptyPromptState());
  const editorViewRef = useRef<EditorView>();

  useHotkeys("up", handleUpArrow);
  useHotkeys("down", handleDownArrow);
  useHotkeys("enter", selectOption);
  useHotkeys("shift+2", () => {
    setIsFilteringActions(true);
    return true;
  });

  function getEmptyPromptState() {
    return EditorState.create({
      schema: promptSchema,
      plugins: [
        ...autocomplete({
          triggers: [{ name: "token", trigger: "/" }],
          reducer: (action) => {
            switch (action.kind) {
              case ActionKind.open:
                setOptionsMode("tokens");
                return true;
              case ActionKind.close:
                setOptionsMode("actions");
                return true;
              case ActionKind.filter:
                editorRangeRef.current = action.range;
                setCurrentFilter(action.filter);
                return true;
              case ActionKind.enter:
                editorRangeRef.current = action.range;
                selectOption();
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
          "@": (_state, _dispatch, _view) => {
            if (optionsModeRef.current === "actions") {
              setIsFilteringActions(true);
              return true;
            }
            return false;
          },
          ArrowUp: handleUpArrow,
          ArrowDown: handleDownArrow,
          Enter: selectOption,
        }),

        keymap(baseKeymap),
        placeholderPlugin("Enter a prompt..."),
      ],
    });
  }

  function handleUpArrow() {
    if (optionsRef.current) {
      const currentOptionIndex = optionsRef.current.findIndex(
        (option) => option === highlightedOptionRef.current
      );
      if (currentOptionIndex > 0) {
        setHighlightedOption(optionsRef.current[currentOptionIndex - 1]);
      }
    }
    return true;
  }

  function handleDownArrow() {
    if (optionsRef.current) {
      const currentOptionIndex = optionsRef.current.findIndex(
        (option) => option === highlightedOptionRef.current
      );
      if (currentOptionIndex < optionsRef.current.length - 1) {
        setHighlightedOption(optionsRef.current[currentOptionIndex + 1]);
      }
    }
    return true;
  }

  function selectOption() {
    const selectedOption = highlightedOptionRef.current;
    if (!selectedOption) return true;

    // this is probably never gonna run, just a safeguard
    if (isFilteringActions) {
      setIsFilteringActions(false);
      return true;
    }

    if (selectedOption.kind === "actions") {
      onAction(selectedOption, promptStateRef.current.doc.toJSON());
      setPromptState(getEmptyPromptState());
    } else if (selectedOption.kind === "tokens") {
      setCurrentToken(selectedOption);
      startTokenEntry(selectedOption);
    } else if (selectedOption.kind === "token-args") {
      insertTokenArg(selectedOption);
    }

    return true;
  }

  function startTokenEntry(token: Token) {
    setPromptState((oldState) =>
      oldState.apply(
        oldState.tr.insertText(
          PATH_SEPARATOR + token.name + " ",
          editorRangeRef.current!.from,
          editorRangeRef.current!.to
        )
      )
    );
  }

  // Change Options list when options mode changes
  useEffect(() => {
    switch (optionsMode) {
      case "actions":
        const actionOptions = rendererLightrail.getActionOptions();
        setOptions(actionOptions);
        setHighlightedOption(
          actionOptions.find(
            (option) => option.name === currentActionRef?.current?.name
          ) ?? actionOptions[0]
        );
        break;
      case "tokens":
        const newOptions = rendererLightrail.getTokenOptions();
        setOptions(newOptions);
        setHighlightedOption(newOptions[0]);
        break;
    }
  }, [optionsMode]);

  // Update Current Action when selected option changes and is an action
  useEffect(() => {
    if (highlightedOption?.kind === "actions") {
      setCurrentAction(highlightedOption);
    }
  }, [highlightedOption]);

  // handle filter changes for token args
  useEffect(() => {
    if (currentFilter && currentToken) {
      const [tokenName, ...tokenArgs] = getTokenAndArgsArray(currentFilter);
      if (
        tokenName === currentToken.name && // Correct token
        tokenArgs[tokenArgs.length - 1] === "" && // Last arg is followed by whitespace (i.e. complete)
        tokenArgs.length === currentToken.args.length + 1 // Correct number of args (counting the whitespace-indicating token)
      ) {
        insertToken(tokenName, tokenArgs.slice(0, -1));
      } else if (tokenName === currentToken.name) {
        const currentArgIndex = tokenArgs.length - 1;
        populateTokenArgOptions(
          currentToken.args[currentArgIndex],
          tokenArgs[currentArgIndex]
        );
      }
    }
  }, [currentFilter, currentToken]);

  // get options for different token arg types
  async function populateTokenArgOptions(
    tokenArg: TokenArgument,
    argFilter: string
  ) {
    if (tokenArg.type === "path") {
      const pathComponents = argFilter.split(PATH_SEPARATOR);
      const dir = pathComponents.slice(0, -1).join(PATH_SEPARATOR);
      const fileFilter = pathComponents[pathComponents.length - 1];

      trpcClient.files.list.query(dir + PATH_SEPARATOR).then((files) => {
        setOptions(
          files
            .filter((f) => {
              console.log(f);
              return f.name.startsWith(fileFilter);
            })
            .map((file) => ({
              name: file.path.length > 20 ? ".../" + file.name : file.path,
              value: file.isDirectory
                ? file.path + PATH_SEPARATOR
                : file.path + " ",
              kind: "token-args",
              description: "",
            }))
        );
      });
    }
  }

  function insertToken(tokenName, tokenArgs) {
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
    setCurrentFilter(undefined);
  }

  function getTokenAndArgsArray(filter: string) {
    return filter.split(/\s+/);
  }

  function insertTokenArg(tokenArg: TokenArgumentOption) {
    if (currentFilterRef.current && editorRangeRef.current) {
      let filterComponents = getTokenAndArgsArray(currentFilterRef.current);
      filterComponents[filterComponents.length - 1] = tokenArg.value;
      setPromptState((oldState) =>
        oldState.apply(
          oldState.tr.insertText(
            "/" + filterComponents.join(" "),
            editorRangeRef.current!.from,
            editorRangeRef.current!.to
          )
        )
      );
    }
  }

  // Handle action filtering when filtering actions
  useEffect(() => {
    if (optionsMode !== "actions") return;
    if (isFilteringActions) {
      const filteredActions = rendererLightrail.getActionOptions(actionsFilter);
      setOptions(filteredActions);
      setHighlightedOption(filteredActions[0]);
    } else {
      const actionOptions = rendererLightrail.getActionOptions();
      setOptions(actionOptions);
    }
  }, [isFilteringActions, actionsFilter]);

  // handle focus when done filtering actions
  useEffect(() => {
    if (!isFilteringActions) {
      editorViewRef.current?.focus();
    }
  }, [isFilteringActions]);

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
          <PromptEditor
            onChange={setPromptState}
            state={promptState}
            onViewReady={(view) => (editorViewRef.current = view)}
          />
        </div>
      </div>
      {currentAction && (
        <div
          className="text-xs px-1 py-0.5 font-light flex flex-row items-center transition-colors border-y"
          style={{
            backgroundColor: currentAction.colors[0] + "20",
            borderColor: currentAction.colors[0] + "50",
          }}
        >
          {isFilteringActions ? (
            <>
              {">"}{" "}
              <input
                type="text"
                className="bg-neutral-50 bg-opacity-10 px-1 active:outline-none focus:outline-none"
                value={actionsFilter}
                onBlur={() => setIsFilteringActions(false)}
                onChange={(e) =>
                  setActionsFilter(e.target.value === "@" ? "" : e.target.value)
                }
                onKeyUp={(e) => {
                  if (e.key === "Escape" || e.key === "Enter") {
                    setIsFilteringActions(false);
                  }
                }}
                autoFocus
              />
              <div className="flex-1" />
              <div className="opacity-50 italic">
                Press 'Esc' to stop filtering
              </div>
            </>
          ) : (
            <>
              {currentAction.name}
              <div className="flex-1" />
              <div className="opacity-50 italic">
                Press '@' to filter actions
              </div>
            </>
          )}
        </div>
      )}
      <OptionsList
        currentToken={currentToken}
        options={options}
        mode={optionsMode}
        highlightedOption={highlightedOption}
      />
    </div>
  );
}

export default PromptInput;
