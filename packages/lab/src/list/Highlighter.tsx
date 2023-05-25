import { makePrefixer } from "@salt-ds/core";
import { ReactElement } from "react";
import { escapeRegExp } from "../utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import highligherCss from "./Highlighter.css";

const withBaseName = makePrefixer("saltHighlighter");

export interface HighlighterProps {
  matchPattern?: RegExp | string;
  text?: string;
}

export const Highlighter = (
  props: HighlighterProps
): ReactElement<HighlighterProps> => {
  const { matchPattern, text = "" } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-hightligher",
    css: highligherCss,
    window: targetWindow,
  });

  const matchRegex =
    typeof matchPattern === "string"
      ? new RegExp(`(${escapeRegExp(matchPattern)})`, "gi")
      : matchPattern;

  if (matchRegex === undefined) {
    return <>{text}</>;
  }
  return (
    <span>
      {text.split(matchRegex).map((part, index) =>
        part.match(matchRegex) ? (
          <strong
            className={withBaseName("highlight")}
            key={`${index}-${part}`}
          >
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
};
