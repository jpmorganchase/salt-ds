import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { HTMLAttributes, ReactElement } from "react";
import overflowSeparatorCss from "./OverflowSeparator.css";

const withBaseName = makePrefixer("saltOverflowSeparator");

export interface OverflowSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  children?: never;
  focusable?: boolean;
}

export const OverflowSeparator = (
  props: OverflowSeparatorProps,
): ReactElement => {
  const { className, focusable, ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overflow-separator",
    css: overflowSeparatorCss,
    window: targetWindow,
  });
  return <div className={clsx(withBaseName(), className)} {...rest} />;
};

OverflowSeparator.defaultProps = {
  focusable: false,
};
