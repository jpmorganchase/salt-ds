import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import optionCss from "./Option.css";

/** Owns the shared Option stylesheet for one list in its target window. */
export function OptionStyleInjection() {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-option",
    css: optionCss,
    window: targetWindow,
  });

  return null;
}
