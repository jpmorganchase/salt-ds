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
   * Emphasis styling variant; defaults to "medium".
   */
  emphasis?: "medium" | "high";
}

const withBaseName = makePrefixer("uitkPanel");

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, children, emphasis = "medium", ...restProps },
  ref
) {
  return (
    <div
      className={cx(withBaseName(), className, {
        uitkEmphasisHigh: emphasis === "high",
      })}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});
