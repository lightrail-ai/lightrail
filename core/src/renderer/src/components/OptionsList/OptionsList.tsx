import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import type { Token, TokenArgument } from "lightrail-sdk";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Option } from "src/util/tracks";

export interface OptionsListProps {
  highlightedOption: Option | undefined;
  currentToken: Token | undefined;
  currentTokenArg: TokenArgument | undefined;
  onHighlightedOptionChange: (option: Option) => void;
  options: Option[];
  mode: OptionsMode;
  onOptionClick: (option: Option) => void;
}

export type OptionsMode = Option["kind"];

function OptionsListItem({
  option,
  currentToken,
  highlighted,
  mode,
  onMouseEnter,
  onClick,
}: {
  option: Option;
  highlighted: boolean;
  currentToken: Token | undefined;
  mode: OptionsMode;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [highlighted]);

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

  return (
    <div
      onMouseEnter={onMouseEnter}
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
      <div>{option.name}</div>
      <div
        className={classNames("flex-1 px-4 truncate", {
          "opacity-30": highlighted,
          "opacity-0": !highlighted,
        })}
      >
        {option.description}
      </div>
    </div>
  );
}

function OptionsList({
  highlightedOption,
  currentToken,
  currentTokenArg,
  options,
  mode,
  onHighlightedOptionChange,
  onOptionClick,
}: OptionsListProps) {
  const [parent, _] = useAutoAnimate({
    duration: 100,
  });

  return (
    <>
      {currentToken && currentTokenArg && (
        <div className="px-6 py-2 flex flex-row">
          <div
            className="pr-6 font-semibold"
            style={{
              color: currentToken.color,
            }}
          >
            {currentToken.name}
          </div>
          <div className="flex flex-row gap-4">
            {currentToken.args.map((t) => (
              <div
                className={classNames({
                  "opacity-100": t === currentTokenArg,
                  "opacity-30": t !== currentTokenArg,
                })}
              >
                <div>{t.name}</div>
                <div>
                  {t === currentTokenArg && (
                    <div className="text-sm">{currentTokenArg.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={classNames(
          "overflow-y-auto overflow-x-hidden max-h-52 border-t border-t-neutral-800 cursor-pointer",
          {
            "bg-neutral-800": mode === "tokens" || mode === "token-args",
          }
        )}
        ref={parent}
      >
        {options.map((option, index) => (
          <OptionsListItem
            onMouseEnter={() => onHighlightedOptionChange(option)}
            onClick={() => onOptionClick(option)}
            currentToken={currentToken}
            mode={mode}
            key={index}
            option={option}
            highlighted={
              option.name === highlightedOption?.name &&
              option.kind === highlightedOption?.kind
            }
          />
        ))}
      </div>
    </>
  );
}

export default OptionsList;
