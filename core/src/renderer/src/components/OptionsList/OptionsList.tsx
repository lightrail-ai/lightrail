import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import type { ActionArgument, Token, TokenArgument } from "lightrail-sdk";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Option } from "src/util/tracks";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import TextInput from "../ui-elements/TextInput/TextInput";
import { faCheck, faUndo } from "@fortawesome/free-solid-svg-icons";
import { trpcClient } from "@renderer/util/trpc-client";
import type { ActionOption, TokenOption } from "../../../../util/tracks";

export interface OptionsListProps {
  highlightedOption: Option | undefined;
  currentToken: TokenOption | undefined;
  currentTokenArg: TokenArgument | undefined;
  currentAction: ActionOption | undefined;
  currentActionArg: ActionArgument | undefined;
  onHighlightedOptionChange: (option: Option) => void;
  options: Option[];
  mode: OptionsMode;
  onOptionClick: (option: Option) => void;
  onRefreshOptions: () => void;
}

export type OptionsMode = Option["kind"] | null;

export function getArgHistoryKey(
  arg: TokenArgument | ActionArgument,
  currentToken: TokenOption | undefined,
  currentAction: ActionOption | undefined,
  kind: "token-args" | "action-args"
) {
  if (arg.type !== "history") return undefined;
  return {
    track:
      kind == "token-args"
        ? currentToken!.track.replace(/\W/g, "")
        : currentAction!.track.replace(/\W/g, ""),
    path: arg.key
      ? `#key`
      : kind === "token-args"
      ? currentToken!.name.replace(/\W/g, "")
      : currentAction!.name.replace(/\W/g, ""),
    arg: arg.key ?? arg.name,
  };
}

function OptionsListItem({
  option,
  currentToken,
  currentTokenArg,
  highlighted,
  mode,
  onMouseMove,
  onClick,
  onRefreshOptions,
}: {
  option: Option;
  highlighted: boolean;
  currentToken: TokenOption | undefined;
  currentTokenArg: TokenArgument | undefined;
  mode: OptionsMode;
  onMouseMove: () => void;
  onClick: () => void;
  onRefreshOptions: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedDescription, setEditedDescription] = React.useState("");

  useEffect(() => {
    if (isEditing) {
      setEditedDescription(option.description);
    }
  }, [isEditing]);

  useEffect(() => {
    setIsEditing(false);
  }, [option]);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [highlighted]);

  function renderEditableHistoryEntry() {
    return (
      <div
        onMouseMove={onMouseMove}
        onClick={isEditing ? undefined : onClick}
        ref={ref}
        className={classNames(
          "transition-colors px-6 py-2 border-l-2 flex flex-row items-center",
          {
            "text-neutral-50 border-l-neutral-50": highlighted,
            "bg-neutral-900": highlighted && mode === "actions",
            "bg-neutral-700": highlighted && mode !== "actions",
            "border-l-transparent": !highlighted,
          }
        )}
      >
        {renderIcon()}
        {isEditing ? (
          <div>
            <div className="flex flex-row items-center gap-4">
              <TextInput
                value={editedDescription}
                onChange={setEditedDescription}
                placeholder="Nickname"
              />
              <div
                className="w-6 h-6 flex items-center justify-center bg-neutral-50 bg-opacity-10 rounded-full hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    option &&
                    option.kind === "token-args" &&
                    currentToken &&
                    currentTokenArg &&
                    currentTokenArg.type === "history"
                  ) {
                    trpcClient.argHistory.append
                      .mutate({
                        ...getArgHistoryKey(
                          currentTokenArg,
                          currentToken,
                          undefined,
                          "token-args"
                        )!,
                        option: {
                          ...option,
                          description: editedDescription,
                        },
                      })
                      .then(() => {
                        setIsEditing(false);
                        onRefreshOptions();
                      });
                  }
                }}
              >
                <FontAwesomeIcon icon={faCheck} size="2xs" />
              </div>
              <div
                className="w-6 h-6 flex items-center justify-center bg-neutral-50 bg-opacity-10 rounded-full hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
              >
                <FontAwesomeIcon icon={faUndo} size="2xs" />
              </div>
            </div>
            <div className="opacity-30">{option.name}</div>
          </div>
        ) : (
          <div>
            <div className="flex flex-row items-center gap-4">
              <div>
                {option.description && option.description.length > 0
                  ? option.description
                  : option.name}
              </div>
              <div
                className="mx-2 w-6 h-6 flex items-center justify-center bg-neutral-50 bg-opacity-10 rounded-full hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                <FontAwesomeIcon icon={faEdit} size="2xs" />
              </div>
            </div>
            {option.description && option.description.length > 0 && (
              <div
                className={classNames("flex-1 truncate", {
                  "opacity-30": highlighted,
                  "opacity-10": !highlighted,
                })}
              >
                {option.name}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderIcon() {
    switch (option.kind) {
      case "actions":
        return (
          <FontAwesomeIcon
            fixedWidth
            icon={["far", option.icon] as IconProp}
            className={classNames("pr-6", {
              "opacity-100": highlighted,
              "opacity-50": !highlighted,
            })}
            style={
              highlighted
                ? {
                    color: option.color,
                  }
                : {}
            }
          />
        );
      case "tokens":
        return (
          <div
            className={classNames("pr-6 font-bold", {
              "opacity-100": highlighted,
              "opacity-10": !highlighted,
            })}
            style={
              highlighted
                ? {
                    color: option.color,
                  }
                : {}
            }
          >
            /
          </div>
        );
      case "token-args":
        return (
          <div
            className={classNames("pr-6 font-bold", {
              "opacity-100": highlighted,
              "opacity-10": !highlighted,
            })}
            style={
              highlighted && currentToken?.color
                ? {
                    color: currentToken.color,
                  }
                : {}
            }
          >
            {currentToken?.name}
          </div>
        );
    }
  }

  return currentTokenArg?.type === "history" && option.kind === "token-args" ? ( // TODO: add support for action-args here
    renderEditableHistoryEntry()
  ) : (
    <div
      onMouseMove={onMouseMove}
      onClick={onClick}
      ref={ref}
      className={classNames(
        "transition-colors px-6 py-2 border-l-2 flex flex-row items-center",
        {
          "text-neutral-50 border-l-neutral-50": highlighted,
          "bg-neutral-900": highlighted && mode === "actions",
          "bg-neutral-700": highlighted && mode !== "actions",
          "border-l-transparent": !highlighted,
        }
      )}
    >
      {renderIcon()}
      {option.kind === "actions" ? (
        <div
          className="text-sm px-2 py-0.5 my-0.5 mr-2 rounded-sm border"
          style={{
            backgroundColor: option.color + "30",
            borderColor: option.color,
            color: option.color,
          }}
        >
          {option.track}
        </div>
      ) : null}
      {option.kind === "tokens" ? (
        <div
          className="rounded-sm"
          style={{
            color: option.color,
          }}
        >
          {option.track}.
        </div>
      ) : null}
      <>
        <div>{option.name}</div>
        <div
          className={classNames("flex-1 px-4 truncate", {
            "opacity-30": highlighted,
            "opacity-0": !highlighted,
          })}
        >
          {option.description}
        </div>
      </>
    </div>
  );
}

function OptionsList({
  highlightedOption,
  currentToken,
  currentTokenArg,
  currentAction,
  currentActionArg,
  options,
  mode,
  onHighlightedOptionChange,
  onOptionClick,
  onRefreshOptions,
}: OptionsListProps) {
  const [parent, _] = useAutoAnimate({
    duration: 100,
  });

  console.log(currentToken, currentTokenArg, currentAction, currentActionArg);
  const currentArgSource = currentToken ?? currentAction;
  const currentArg = currentTokenArg ?? currentActionArg;

  return (
    <>
      {currentArgSource && currentArg && (
        <div className="px-6 py-2 flex flex-row">
          <div
            className="pr-6 font-semibold"
            style={{
              color: currentArgSource.color,
            }}
          >
            {currentArgSource.name}
          </div>
          <div className="flex flex-row gap-4">
            {currentArgSource.args.map((t) => (
              <div
                className={classNames({
                  "opacity-100": t === currentArg,
                  "opacity-30": t !== currentArg,
                })}
              >
                <div>{t.name}</div>
                <div>
                  {t === currentArg && (
                    <div className="text-sm">{currentArg.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={classNames(
          "overflow-y-auto overflow-x-hidden max-h-52 cursor-pointer",
          {
            "bg-neutral-800": mode === "tokens" || mode === "token-args",
            "border-t border-t-neutral-800": options.length > 0,
          }
        )}
        ref={parent}
      >
        {options.map((option, index) => (
          <OptionsListItem
            onMouseMove={() =>
              highlightedOption !== option && onHighlightedOptionChange(option)
            }
            onClick={() => onOptionClick(option)}
            currentToken={currentToken}
            currentTokenArg={currentTokenArg}
            mode={mode}
            key={index}
            option={option}
            highlighted={
              option.name === highlightedOption?.name &&
              option.kind === highlightedOption?.kind
            }
            onRefreshOptions={onRefreshOptions}
          />
        ))}
      </div>
    </>
  );
}

export default OptionsList;
