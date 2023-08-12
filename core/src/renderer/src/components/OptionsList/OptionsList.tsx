import React, { useEffect, useRef } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import type { Action, Token, TokenArgumentOption } from "lightrail-sdk";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export interface OptionsListProps {
  highlightedOption: Option | undefined;
  currentToken: Token | undefined;
  options: Option[];
  mode: OptionsMode;
}

export type Option =
  | (Action & { kind: "actions" })
  | (Token & { kind: "tokens" })
  | (TokenArgumentOption & { kind: "token-args" });

export type OptionsMode = Option["kind"];

function OptionsListItem({
  option,
  currentToken,
  highlighted,
  mode,
}: {
  option: Option;
  highlighted: boolean;
  currentToken: Token | undefined;
  mode: OptionsMode;
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
                    color: option.colors[0],
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
          >
            /{currentToken?.name}
          </div>
        );
    }
  }

  return (
    <div
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
      <span>{option.name}</span>
      {option.description && highlighted && (
        <span className="opacity-30 pl-4">{option.description}</span>
      )}
    </div>
  );
}

function OptionsList({
  highlightedOption,
  currentToken,
  options,
  mode,
}: OptionsListProps) {
  const [parent, _] = useAutoAnimate({
    duration: 100,
  });

  return (
    <div
      className={classNames(
        "overflow-y-auto overflow-x-hidden max-h-48 border-t border-t-neutral-800",
        {
          "bg-neutral-800": mode === "tokens" || mode === "token-args",
        }
      )}
      ref={parent}
    >
      {options.map((option, index) => (
        <OptionsListItem
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
  );
}

export default OptionsList;
