import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { escapeRegExp } from "../../utils";
import highlighterCss from "./Highlighter.css";

const baseName = "saltHighlighter";

export const Highlighter = (props) => {
  const { matchPattern, text = "" } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-highligher-deprecated",
    css: highlighterCss,
    window: targetWindow,
  });
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
        ),
      )}
    </>
  );
};
