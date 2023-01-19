import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import "./SkipLinks.css";

const withBaseName = makePrefixer("saltSkipLinks");

export const SkipLinks = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function SkipLinks(props, ref) {
  const { className, children, ...restProps } = props;

  return (
    <ul {...restProps} className={clsx(withBaseName(), className)} ref={ref}>
      {children}
    </ul>
  );
});
