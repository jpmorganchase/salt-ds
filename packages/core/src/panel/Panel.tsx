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

const withBaseName = makePrefixer("uitkPanel");

export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Panel({ className, children, ...restProps }, ref) {
    return (
      <div className={cx(withBaseName(), className)} ref={ref} {...restProps}>
        {children}
      </div>
    );
  }
);
