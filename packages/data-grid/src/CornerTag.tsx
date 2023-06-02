import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import cornerTagCss from "./CornerTag.css";

export interface CornerTagProps {
  focusOnly?: boolean; // Show when the parent is focused, hide when not
}

export function CornerTag(props: CornerTagProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-corner-tag",
    css: cornerTagCss,
    window: targetWindow,
  });

  return (
    <div
      className={
        props.focusOnly ? "saltGridCornerTag-focusOnly" : "saltGridCornerTag"
      }
    />
  );
}
