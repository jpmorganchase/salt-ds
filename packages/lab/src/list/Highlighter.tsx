import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ReactElement } from "react";
import { escapeRegExp } from "../utils";

import "./Highlighter.css";

const withBaseName = makePrefixer("uitkHighlighter");

export interface HighlighterProps {
  matchPattern?: RegExp | string;
  text?: string;
}

export const Highlighter = (
  props: HighlighterProps
): ReactElement<HighlighterProps> => {
  const { matchPattern, text = "" } = props;
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
