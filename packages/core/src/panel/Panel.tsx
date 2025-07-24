import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { makePrefixer } from "../utils";
import panelCss from "./Panel.css";

/**
 * Panel component that acts as wrapper around a node
 *
 * @example
 * const PanelExample = () => (
 *   <Panel>
 *     <p>This is a panel around some text.</p>
 *   </Panel>
 * );
 *
 */

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary" | "tertiary";
}

const withBaseName = makePrefixer("saltPanel");

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, children, variant = "primary", ...restProps },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-panel",
    css: panelCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), withBaseName(variant), className)}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});
