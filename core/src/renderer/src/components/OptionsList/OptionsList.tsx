import React, { useEffect, useRef } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import type { Action, Token, TokenArgumentOption } from "lightrail-sdk";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export interface OptionsListProps {
  selectedIndex: number;
  currentToken: Token | null;
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
  selected,
  mode,
}: {
  option: Option;
  selected: boolean;
  currentToken: Token | null;
  mode: OptionsMode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [selected]);

  function renderIcon() {
    switch (option.kind) {
      case "actions":
        return (
          <FontAwesomeIcon
            fixedWidth
            icon={["far", option.icon] as IconProp}
            className={classNames("pr-6", {
              "opacity-100": selected,
              "opacity-50": !selected,
            })}
          />
        );
      case "tokens":
        return (
          <div
            className={classNames("pr-6 font-bold", {
              "opacity-100": selected,
              "opacity-10": !selected,
            })}
          >
            /
          </div>
        );
      case "token-args":
        return (
          <div
            className={classNames("pr-6 font-bold", {
              "opacity-100": selected,
              "opacity-10": !selected,
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
          "bg-neutral-700 text-neutral-50 border-l-neutral-50": selected,
          "border-l-transparent": !selected,
        }
      )}
    >
      {renderIcon()}
      <span>{option.name}</span>
    </div>
  );
}

function OptionsList({
  selectedIndex,
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
        "overflow-y-auto max-h-48 border-t border-t-neutral-800",
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
          selected={index === selectedIndex}
        />
      ))}
    </div>
  );
}

export default OptionsList;
