import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@brandname/core";

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
   * Determines the emphasis of the component. Must be one of: 'medium', 'high'.
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
      className={cx(
        withBaseName(),
        {
          [`uitkEmphasisMedium`]: emphasis !== "high",
        },
        className
      )}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});
