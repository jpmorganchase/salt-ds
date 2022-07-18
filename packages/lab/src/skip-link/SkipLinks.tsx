import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./SkipLinks.css";

const withBaseName = makePrefixer("uitkSkipLinks");

export const SkipLinks = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function SkipLinks(props, ref) {
  const { className, children, ...restProps } = props;

  return (
    <ul {...restProps} className={cx(withBaseName(), className)} ref={ref}>
      {children}
    </ul>
  );
});
