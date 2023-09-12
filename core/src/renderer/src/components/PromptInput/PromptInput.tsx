import { useEffect, useRef, useState } from "react";
import PromptEditor, {
  placeholderPlugin,
  promptSchema,
} from "../PromptEditor/PromptEditor";
import { EditorState } from "prosemirror-state";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import autocomplete, {
  ActionKind,
  FromTo,
  closeAutocomplete,
} from "prosemirror-autocomplete";
import OptionsList, { OptionsMode } from "../OptionsList/OptionsList";
import { Option, TokenOption } from "../../../../util/tracks";
import { useHotkeys } from "react-hotkeys-hook";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { promptHistoryAtom, viewAtom } from "@renderer/state";
import type {
  Token,
  Action,
  TokenArgument,
  TokenArgumentOption,
  ArgsValues,
} from "lightrail-sdk";
import { trpcClient } from "@renderer/util/trpc-client";
import { useStateWithRef } from "@renderer/util/custom-hooks";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { rendererTracksManager } from "@renderer/util/lightrail-renderer";

const PATH_SEPARATOR = "/";

export interface PromptInputProps {
  onAction: (action: Option, prompt: object) => void;
}

function PromptInput({ onAction }: PromptInputProps) {
  const setView = useSetRecoilState(viewAtom);
  const promptHistory = useRecoilValue(promptHistoryAtom);
  const [promptHistoryIndex, setPromptHistoryIndex] = useState(-1);

  const [optionsMode, setOptionsMode, optionsModeRef] =
    useStateWithRef<OptionsMode>("actions"); // TODO: can possibly refactor this out
  const [options, setOptions, optionsRef] = useStateWithRef<Option[]>([]);
  const [highlightedOption, setHighlightedOption, highlightedOptionRef] =
    useStateWithRef<Option | undefined>(undefined);
  const [currentToken, setCurrentToken] = useState<TokenOption | undefined>(
    undefined
  );
  const [currentTokenArg, setCurrentTokenArg] = useState<
    TokenArgument | undefined
  >();
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
    useStateWithRef<EditorState>(getNewPromptState());
  const editorViewRef = useRef<EditorView>();

  useHotkeys("up", handleUpArrow);
  useHotkeys("down", handleDownArrow);
  useHotkeys("enter", selectOption);
  useHotkeys("shift+2", () => {
    setIsFilteringActions(true);
    return true;
  });
  useHotkeys("mod+up", handleHistoryGoPrev);
  useHotkeys("mod+down", handleHistoryGoNext);

  function getNewPromptState(docJson?: object) {
    return EditorState.create({
      doc: docJson ? Node.fromJSON(promptSchema, docJson) : undefined,
      schema: promptSchema,
      plugins: [
        ...autocomplete({
          triggers: [{ name: "token", trigger: /(?:^|\s)(\/)/ }],
          reducer: (action) => {
            switch (action.kind) {
              case ActionKind.open:
                setOptionsMode("tokens");
                editorRangeRef.current = action.range;
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
          "Mod-ArrowUp": handleHistoryGoPrev,
          "Mod-ArrowDown": handleHistoryGoNext,
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

  function handleHistoryGoPrev() {
    setPromptHistoryIndex((prev) => {
      if (prev === promptHistory.length - 1) return prev;
      return prev + 1;
    });
    return true;
  }

  function handleHistoryGoNext() {
    setPromptHistoryIndex((prev) => {
      if (prev === -1) return prev;
      return prev - 1;
    });
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
      setPromptHistoryIndex(-1);
      setPromptState(getNewPromptState());
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

  // Update prompt state when prompt history index changes
  useEffect(() => {
    if (promptHistoryIndex === -1) {
      setPromptState(getNewPromptState());
    } else if (promptHistory[promptHistoryIndex]) {
      setPromptState(getNewPromptState(promptHistory[promptHistoryIndex]));
    }
  }, [promptHistoryIndex]);

  // Change Options list when options mode changes
  useEffect(() => {
    switch (optionsMode) {
      case "actions":
        const actionOptions = rendererTracksManager.getActionList();
        setOptions(actionOptions);
        setHighlightedOption(
          actionOptions.find(
            (option) => option.name === currentActionRef?.current?.name
          ) ?? actionOptions[0]
        );
        break;
      case "tokens":
        const newOptions = rendererTracksManager.getTokenList();
        setOptions(newOptions);
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
        const namedArgs = createArgsValues(currentFilter, currentToken.args);
        for (const arg of currentToken.args) {
          if (arg.type === "history") {
            trpcClient.argHistory.append.mutate({
              track: currentToken.track,
              token: arg.key ? `#key` : currentToken.name,
              arg: arg.key ?? arg.name,
              option: {
                value: namedArgs[arg.name] + " ",
                name: namedArgs[arg.name],
              },
            });
          }
        }

        insertToken(currentToken.track, tokenName, namedArgs);
      } else if (tokenName === currentToken.name) {
        const currentArgIndex = tokenArgs.length - 1;
        populateTokenArgOptions(
          currentToken.args[currentArgIndex],
          tokenArgs[currentArgIndex]
        );
      }
    } else if (currentFilter) {
      // Haven't selected a token yet, just filter tokens
      const filteredTokens = rendererTracksManager.getTokenList(currentFilter);
      // if (filteredTokens.length < 1) {
      //   closeAutocomplete(editorViewRef.current!);
      // } else {
      setOptions(filteredTokens);
      setHighlightedOption(filteredTokens[0]);
      // }
    }
  }, [currentFilter, currentToken]);

  // Make highlighted option the first option when options change (if its not currently in options)
  useEffect(() => {
    if (
      options &&
      (!highlightedOption || !options.includes(highlightedOption))
    ) {
      setHighlightedOption(options[0]);
    }
  }, [options, highlightedOption]);

  // get options for different token arg types
  async function populateTokenArgOptions(
    tokenArg: TokenArgument,
    argFilter: string
  ) {
    if (!tokenArg) return;
    setCurrentTokenArg(tokenArg);
    if (tokenArg.type === "path") {
      const pathComponents = argFilter.split(PATH_SEPARATOR);
      const dir = pathComponents.slice(0, -1).join(PATH_SEPARATOR);
      const fileFilter = pathComponents[pathComponents.length - 1];

      trpcClient.files.list.query(dir + PATH_SEPARATOR).then((files) => {
        setOptions(
          files
            .filter((f) => {
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
    } else if (tokenArg.type === "history") {
      const historyOptions = await trpcClient.argHistory.get.query({
        track: currentToken!.track,
        token: tokenArg.key ? `#key` : currentToken!.name,
        arg: tokenArg.key ?? tokenArg.name,
      });
      setOptions(
        historyOptions.map((option) => ({
          ...option,
          kind: "token-args",
        }))
      );
    } else if (tokenArg.type === "custom") {
      const customOptions = await trpcClient.handlers.query({
        track: currentToken!.track,
        token: currentToken!.name,
        arg: tokenArg.name,
        input: createArgsValues(currentFilterRef.current!, currentToken!.args),
      });
      setOptions(
        customOptions.map((option) => ({
          ...option,
          kind: "token-args",
        }))
      );
    }
  }

  function insertToken(trackName, tokenName, tokenArgs: ArgsValues) {
    let tokenType = promptSchema.nodes.token;
    let node = tokenType.create({
      track: trackName,
      name: tokenName,
      args: tokenArgs,
    });
    setPromptState((oldState) => {
      const temp = oldState.apply(
        oldState.tr.insertText(
          " ",
          editorRangeRef.current!.to,
          editorRangeRef.current!.to
        )
      );
      return temp.apply(
        temp.tr.replaceRangeWith(
          editorRangeRef.current!.from,
          editorRangeRef.current!.to,
          node
        )
      );
    });
    setCurrentFilter(undefined);
  }

  function getTokenAndArgsArray(filter: string) {
    return filter.split(/\s+/);
  }

  function createArgsValues(str: string, args: TokenArgument[]): ArgsValues {
    const [_, ...tokenArgs] = getTokenAndArgsArray(str);
    return args.reduce((acc, arg, i) => {
      acc[arg.name] = tokenArgs[i];
      return acc;
    }, {});
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
      const filteredActions =
        rendererTracksManager.getActionList(actionsFilter);
      setOptions(filteredActions);
      setHighlightedOption(filteredActions[0]);
    } else {
      const actionOptions = rendererTracksManager.getActionList();
      setOptions(actionOptions);
    }
  }, [isFilteringActions, actionsFilter]);

  // handle focus when done filtering actions
  useEffect(() => {
    if (!isFilteringActions) {
      setActionsFilter("");
      editorViewRef.current?.focus();
    }
  }, [isFilteringActions]);

  // Unset current token when in actions mode
  useEffect(() => {
    if (optionsMode === "actions") {
      setCurrentToken(undefined);
    }
  }, [optionsMode]);

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
            backgroundColor: currentAction.color + "20",
            borderColor: currentAction.color + "50",
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
                onKeyUpCapture={(e) => {
                  if (
                    e.key === "Escape" ||
                    e.key === "Enter" ||
                    e.key === "Tab"
                  ) {
                    setIsFilteringActions(false);
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
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
        currentTokenArg={currentTokenArg}
        options={options}
        mode={optionsMode}
        highlightedOption={highlightedOption}
        onHighlightedOptionChange={setHighlightedOption}
        onOptionClick={(option) => {
          setHighlightedOption(option);
          selectOption();
        }}
        onRefreshOptions={() => {
          if (currentTokenArg && currentFilter) {
            populateTokenArgOptions(currentTokenArg, currentFilter);
          }
          // Add other cases here as needed?
        }}
      />
    </div>
  );
}

export default PromptInput;
