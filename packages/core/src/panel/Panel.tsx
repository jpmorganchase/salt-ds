import { clsx } from "clsx";
import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "../utils";

import panelCss from "./Panel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
  variant?: "primary" | "secondary";
}

const withBaseName = makePrefixer("saltPanel");

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, children, variant = "primary", ...restProps },
  ref
) {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-panel",
    css: panelCss as string,
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
