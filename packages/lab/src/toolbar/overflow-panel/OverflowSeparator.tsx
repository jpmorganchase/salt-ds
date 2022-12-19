import { makePrefixer } from "@salt-ds/core";
import cx from "classnames";
import { HTMLAttributes, ReactElement } from "react";
import "./OverflowSeparator.css";

const withBaseName = makePrefixer("saltOverflowSeparator");

export interface OverflowSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  children?: never;
  focusable?: boolean;
}

export const OverflowSeparator = (
  props: OverflowSeparatorProps
): ReactElement => {
  const { className, focusable, ...rest } = props;
  return <div className={cx(withBaseName(), className)} {...rest} />;
};

OverflowSeparator.defaultProps = {
  focusable: false,
};
