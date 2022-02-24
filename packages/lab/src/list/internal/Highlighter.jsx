import React from "react";
import { escapeRegExp } from "../../utils";

import "./Highlighter.css";

const baseName = "uitkHighlighter";

export const Highlighter = (props) => {
  const { matchPattern, text = "" } = props;
  const matchRegex =
    typeof matchPattern === "string"
      ? new RegExp(`(${escapeRegExp(matchPattern)})`, "gi")
      : matchPattern;
  return (
    <>
      {text.split(matchRegex).map((part, index) =>
        part.match(matchRegex) ? (
          <strong className={`${baseName}-highlight`} key={`${index}-${part}`}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
};
