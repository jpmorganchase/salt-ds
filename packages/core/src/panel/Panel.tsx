import cx from "classnames";
import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "../utils";

import "./Panel.css";

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

const withBaseName = makePrefixer("uitkPanel");

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, children, variant = "primary", ...restProps },
  ref
) {
  return (
    <div
      className={cx(withBaseName(), className, {
        [withBaseName(variant)]: variant === "secondary",
      })}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});
