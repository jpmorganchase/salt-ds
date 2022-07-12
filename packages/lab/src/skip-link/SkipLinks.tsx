import { Children, forwardRef, HTMLAttributes, isValidElement } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./SkipLinks.css";

const renderListItem = (child: { key: React.Key | null | undefined }) => (
  <li key={child.key}>{child}</li>
);

const withBaseName = makePrefixer("uitkSkipLinks");

export const SkipLinks = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>((props, ref) => {
  const { className, children, ...restProps } = props;

  return (
    <ul {...restProps} className={cx(withBaseName(), className)} ref={ref}>
      {Children.toArray(children).filter(isValidElement).map(renderListItem)}
    </ul>
  );
});
