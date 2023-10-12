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
import OptionsList, {
  OptionsMode,
  getArgHistoryKey,
} from "../OptionsList/OptionsList";
import { ActionOption, Option, TokenOption } from "../../../../util/tracks";
import { useHotkeys } from "react-hotkeys-hook";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { promptHistoryAtom, viewAtom } from "@renderer/state";
import type {
  Token,
  TokenArgument,
  TokenArgumentOption,
  ActionArgument,
  ArgsValues,
} from "lightrail-sdk";
import { trpcClient } from "@renderer/util/trpc-client";
import { useStateWithRef } from "@renderer/util/custom-hooks";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { rendererTracksManager } from "@renderer/util/lightrail-renderer";
import classNames from "classnames";
import { shouldTextBeBlack } from "@renderer/util/util";
import { AutowidthInput } from "react-autowidth-input";

const PATH_SEPARATOR = "/";

export interface PromptInputProps {
  onAction: (action: Option, prompt: object, args?: ArgsValues) => void;
}

function PromptInput({ onAction }: PromptInputProps) {
  const setView = useSetRecoilState(viewAtom);
  const promptHistory = useRecoilValue(promptHistoryAtom);
  const [promptHistoryIndex, setPromptHistoryIndex] = useState(-1);

  const [optionsMode, setOptionsMode, optionsModeRef] =
    useStateWithRef<OptionsMode>(null);
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
    ActionOption | undefined
  >(undefined);
  const [currentActionArg, setCurrentActionArg] = useState<
    ActionArgument | undefined
  >();
  const [actionArgValues, setActionArgValues, actionArgValuesRef] =
    useStateWithRef<ArgsValues>({});
  const [currentFilter, setCurrentFilter, currentFilterRef] = useStateWithRef<
    string | undefined
  >(undefined);
  const editorRangeRef = useRef<FromTo>();
  const [actionsFilter, setActionsFilter] = useState("");

  const [promptState, setPromptState, promptStateRef] =
    useStateWithRef<EditorState>(getNewPromptState());
  const editorViewRef = useRef<EditorView>();
  const actionsFilterInputRef = useRef<HTMLInputElement>(null);
  const actionArgInputRef = useRef<HTMLInputElement>(null);

  type Timeout = ReturnType<typeof setTimeout>;
  const refocusMainInputTimeoutRef = useRef<Timeout>();

  useHotkeys("up", handleUpArrow);
  useHotkeys("down", handleDownArrow);
  useHotkeys("enter", selectOption);
  useHotkeys("shift+2", () => {
    setCurrentAction(undefined);
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
                setOptionsMode(null);
                setCurrentToken(undefined);
                setCurrentTokenArg(undefined);
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
            if (optionsModeRef.current === null) {
              setCurrentAction(undefined);
              return true;
            }
            return false;
          },
          ArrowUp: handleUpArrow,
          ArrowDown: handleDownArrow,
          Enter: selectOption,
          Escape: () => {
            if (optionsModeRef.current === null) {
              setCurrentAction(undefined);
              return true;
            }
            return false;
          },
          "Mod-ArrowUp": handleHistoryGoPrev,
          "Mod-ArrowDown": handleHistoryGoNext,
        }),

        keymap(baseKeymap),
        placeholderPlugin(),
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

  function updateOptionsList() {
    if (optionsMode === "actions") {
      const actionOptions = rendererTracksManager.getActionList(
        actionsFilter ?? undefined
      );

      setOptions(actionOptions);
      setHighlightedOption(
        actionOptions.find(
          (option) => option.name === currentActionRef?.current?.name
        ) ?? actionOptions[0]
      );
    } else if (optionsMode === "tokens") {
      const newOptions = rendererTracksManager.getTokenList(currentFilter);
      setOptions(newOptions);
    } else if (optionsMode === "token-args" && currentToken && currentFilter) {
      const [_, ...tokenArgs] = getTokenAndArgsArray(currentFilter);
      const currentArgIndex = tokenArgs.length - 1;
      const tokenArg = currentToken.args[currentArgIndex];

      if (!tokenArg) {
        setOptions([]);
        setCurrentTokenArg(undefined);
        return;
      }

      setCurrentTokenArg(tokenArg);
      getArgOptions(tokenArg, tokenArgs[currentArgIndex], "token-args").then(
        (opts) => {
          if (optionsModeRef.current !== "token-args") return;
          setOptions(opts);
        }
      );
    } else if (optionsMode === "action-args" && currentActionArg) {
      getArgOptions(
        currentActionArg,
        actionArgValues[currentActionArg.name],
        "action-args"
      ).then((opts) => {
        if (optionsModeRef.current !== "action-args") return;
        setOptions(opts);
      });
    } else {
      setOptions([]);
    }
  }

  // Change options list whenever necessary
  useEffect(() => {
    updateOptionsList();
  }, [
    optionsMode,
    actionsFilter,
    currentFilter,
    currentToken,
    currentAction,
    currentActionArg,
    actionArgValues,
  ]);

  // get options for different token arg types
  async function getArgOptions(
    arg: TokenArgument | ActionArgument,
    argFilter: string,
    kind: "token-args" | "action-args"
  ): Promise<(TokenArgumentOption & { kind: "token-args" | "action-args" })[]> {
    if (arg.type === "path") {
      const pathComponents = argFilter.split(PATH_SEPARATOR);
      const dir = pathComponents.slice(0, -1).join(PATH_SEPARATOR);
      const fileFilter = pathComponents[pathComponents.length - 1];

      const files = await trpcClient.files.list.query(dir + PATH_SEPARATOR);
      return files
        .filter((f) => {
          return f.name.startsWith(fileFilter);
        })
        .map((file) => ({
          name: file.path.length > 20 ? ".../" + file.name : file.path,
          value: file.isDirectory
            ? file.path + PATH_SEPARATOR
            : file.path + " ",
          kind,
          description: "",
        }));
    } else if (arg.type === "history") {
      const historyOptions = await trpcClient.argHistory.get.query(
        getArgHistoryKey(arg, currentToken, currentAction, kind)!
      );

      return [
        ...(argFilter.length > 0
          ? [
              {
                name: argFilter,
                value: argFilter + " ",
                description: "",
              },
            ]
          : []),
        ...historyOptions.filter(
          (option) =>
            argFilter.length > 0 && option.name.trim() !== argFilter.trim()
        ),
      ].map((option) => ({
        ...option,
        kind,
      }));
    } else if (arg.type === "custom") {
      const customOptions = await trpcClient.handlers.query(
        kind === "action-args"
          ? {
              track: currentAction!.track,
              action: currentAction!.name,
              arg: arg.name,
              input: actionArgValues,
            }
          : {
              track: currentToken!.track,
              token: currentToken!.name,
              arg: arg.name,
              input: createArgsValues(
                currentFilterRef.current!,
                currentToken!.args
              ),
            }
      );
      return customOptions.map((option) => ({
        ...option,
        kind,
      }));
    }
    return [];
  }

  function selectOption() {
    if (optionsModeRef.current === null) {
      if (currentActionRef.current) {
        onAction(
          currentActionRef.current,
          promptStateRef.current.doc.toJSON(),
          actionArgValuesRef.current
        );
        setPromptHistoryIndex(-1);
        setPromptState(getNewPromptState());
        if (
          currentActionRef.current.name === "Reset Conversation" &&
          currentActionRef.current.track === "lightrail"
        ) {
          setCurrentAction(undefined);
        }
      } else {
        setOptionsMode("actions");
      }
      return true;
    }

    const selectedOption = highlightedOptionRef.current;
    if (!selectedOption) {
      editorViewRef.current?.focus();
      return true;
    }

    if (selectedOption.kind === "actions") {
      setCurrentAction(selectedOption);
      return true;
    } else if (selectedOption.kind === "tokens") {
      setCurrentToken(selectedOption);
      startTokenEntry(selectedOption);
    } else if (selectedOption.kind === "token-args") {
      insertTokenArg(selectedOption);
    } else if (selectedOption.kind === "action-args") {
      setActionArgValues((prev) => ({
        ...prev,
        [currentActionArg!.name]: selectedOption.value,
      }));
      if (selectedOption.value.endsWith(" ")) {
        setOptionsMode(null);
        setCurrentActionArg(undefined);
        editorViewRef.current?.focus(); // TODO: this currently only supports single-argument actions, need to improve
      } else {
        actionArgInputRef.current?.focus();
      }
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

  // Insert completed tokens
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
              ...getArgHistoryKey(arg, currentToken, undefined, "token-args")!,
              option: {
                value: namedArgs[arg.name] + " ",
                name: namedArgs[arg.name],
              },
            });
          }
        }

        insertToken(currentToken.track, tokenName, namedArgs);
      } else {
        setOptionsMode("token-args");
      }
    }
  }, [currentFilter, currentToken]);

  // Make sure filtering triggers action completions. This is a hack, it shouldn't be necessary bc switching to filtering should auto-set the options mode
  useEffect(() => {
    if (actionsFilter.length > 0) {
      setOptionsMode("actions");
    }
  }, [actionsFilter]);

  // Make highlighted option the first option when options change (if its not currently in options)
  useEffect(() => {
    if (
      options &&
      (!highlightedOption || !options.includes(highlightedOption))
    ) {
      setHighlightedOption(options[0]);
    }
  }, [options, highlightedOption]);

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

  useEffect(() => {
    setActionsFilter("");
    if (!currentAction) {
      setOptionsMode("actions");
    } else {
      const args = currentAction.args ?? [];
      if (args.length === 0) {
        editorViewRef.current?.focus();
        setOptionsMode(null);
      } else {
        setActionArgValues(
          Object.fromEntries(args.map((arg) => [arg.name, ""]))
        );
      }
    }
  }, [currentAction]);

  // Unset current token when in actions mode
  useEffect(() => {
    if (optionsMode === "actions") {
      setCurrentToken(undefined);
    }
  }, [optionsMode]);

  // Update placeholder on changed action
  useEffect(() => {
    if (!currentAction) {
      setPromptState((oldState) =>
        oldState.apply(oldState.tr.setMeta("placeholder", "← Choose an action"))
      );
    } else if (currentAction) {
      if (currentAction.placeholder) {
        setPromptState((oldState) =>
          oldState.apply(
            oldState.tr.setMeta("placeholder", currentAction.placeholder)
          )
        );
      } else {
        setPromptState((oldState) =>
          oldState.apply(
            oldState.tr.setMeta(
              "placeholder",
              "Enter a prompt (type '/' to add context)"
            )
          )
        );
      }
    }
  }, [currentAction]);

  return (
    <div className="min-w-[600px]">
      <div className="relative my-0.5">
        <button
          className="absolute right-1 top-1 opacity-50 hover:opacity-100"
          onClick={() => setView("settings")}
        >
          <FontAwesomeIcon icon={faGear} size={"xs"} />
        </button>
        <div className="relative p-4 cursor-text z-10">
          {!currentAction ? (
            <div className="mr-2 px-1 py-0.5 rounded-sm font-semibold text-sm inline-flex flex-row border border-neutral-700 items-center justify-center">
              <div className="pr-1 opacity-80">@</div>
              <AutowidthInput
                type="text"
                ref={actionsFilterInputRef}
                placeholder="Filter Actions..."
                placeholderIsMinWidth
                className="bg-transparent active:outline-none focus:outline-none w-24 placeholder:font-normal"
                value={actionsFilter}
                onChange={(e) =>
                  setActionsFilter(e.target.value === "@" ? "" : e.target.value)
                }
                onFocus={() => {
                  clearTimeout(refocusMainInputTimeoutRef.current);
                  setOptionsMode("actions");
                  setCurrentActionArg(undefined);
                }}
                onKeyUpCapture={(e) => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    selectOption();
                    e.preventDefault();
                    e.stopPropagation();
                  } else if (e.key === "ArrowUp") {
                    handleUpArrow();
                  } else if (e.key === "ArrowDown") {
                    handleDownArrow();
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            currentAction && (
              <div
                className={classNames(
                  "rounded-sm font-semibold text-sm inline-flex flex-row items-center justify-center transition-all mr-2 pr-2",
                  {
                    "text-neutral-950": shouldTextBeBlack(currentAction?.color),
                  }
                )}
                style={{
                  backgroundColor: currentAction?.color,
                }}
              >
                <div
                  className={classNames(
                    "pl-1 py-0 cursor-pointer inline-flex flex-row items-center flex-shrink-0"
                  )}
                  onClick={(e) => {
                    setCurrentAction(undefined);
                    e.stopPropagation();
                    return false;
                  }}
                >
                  <div className="opacity-50 pr-1 flex-shrink-0">@</div>
                  <div className="flex-shrink-0">{currentAction?.name}</div>
                </div>
                {currentAction?.args.map((arg) => (
                  <AutowidthInput
                    autoFocus
                    ref={actionArgInputRef}
                    onBlur={() => {
                      refocusMainInputTimeoutRef.current = setTimeout(() => {
                        setCurrentActionArg(undefined);
                        setOptionsMode(null);
                        editorViewRef.current?.focus();
                      }, 500);
                    }}
                    onFocus={() => {
                      clearTimeout(refocusMainInputTimeoutRef.current);
                      setCurrentActionArg(arg);
                      setOptionsMode("action-args");
                    }}
                    onKeyUpCapture={(e) => {
                      if (e.key === "Escape" || e.key === "Tab") {
                        editorViewRef.current?.focus();
                        e.preventDefault();
                        e.stopPropagation();
                      } else if (e.key === "Enter") {
                        selectOption();
                      } else if (e.key === "ArrowUp") {
                        handleUpArrow();
                      } else if (e.key === "ArrowDown") {
                        handleDownArrow();
                      }
                    }}
                    className={classNames(
                      "mx-2 px-1 h-full rounded-sm font-semibold text-sm bg-neutral-950 bg-opacity-30 focus:outline-none  placeholder:opacity-50",
                      {
                        "text-neutral-950 placeholder:text-neutral-950":
                          shouldTextBeBlack(currentAction?.color),
                      }
                    )}
                    key={currentAction.name + arg.name}
                    value={actionArgValues[arg.name]}
                    onChange={(e) => {
                      setActionArgValues((prev) => ({
                        ...prev,
                        [arg.name]: e.target.value,
                      }));
                    }}
                    placeholder={arg.name}
                    placeholderIsMinWidth
                  />
                ))}
              </div>
            )
          )}
          <PromptEditor
            className="inline-block min-w-[300px] my-0.5"
            onClick={() => {
              if (currentAction) {
                editorViewRef.current?.focus();
              } else {
                actionsFilterInputRef.current?.focus();
              }
            }}
            onChange={setPromptState}
            state={promptState}
            onViewReady={(view) => (editorViewRef.current = view)}
            readonly={!currentAction}
          />
        </div>
      </div>

      <OptionsList
        currentToken={currentToken}
        currentTokenArg={currentTokenArg}
        currentAction={currentAction}
        currentActionArg={currentActionArg}
        options={options}
        mode={optionsMode}
        highlightedOption={highlightedOption}
        onHighlightedOptionChange={setHighlightedOption}
        onOptionClick={(option) => {
          setHighlightedOption(option);
          selectOption();
        }}
        onRefreshOptions={() => {
          updateOptionsList();
        }}
      />
    </div>
  );
}

export default PromptInput;
