import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { HTMLAttributes, ReactElement } from "react";
import overflowSeparatorCss from "./OverflowSeparator.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltOverflowSeparator");

export interface OverflowSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  children?: never;
  focusable?: boolean;
}

export const OverflowSeparator = (
  props: OverflowSeparatorProps
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
