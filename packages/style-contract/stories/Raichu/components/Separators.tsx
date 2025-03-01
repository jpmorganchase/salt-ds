import "./Separators.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import styles from "./Separators.css";

export function HorizontalSeparator({
  variant = "primary",
}: {
  variant?: "primary" | "secondary" | "tertiary";
}) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-story-raichu-separator",
    css: styles,
    window: targetWindow,
  });

  return <div className={`horizontalSeparator ${variant}`} />;
}
