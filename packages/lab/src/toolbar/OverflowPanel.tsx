import React, { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./OverflowPanel.css";

interface OverflowPanelProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("uitkOverflowPanel");

export const OverflowPanel = forwardRef(function OverflowPanel(
  { children, className, ...htmlAttributes }: OverflowPanelProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      {...htmlAttributes}
      className={cx(withBaseName(), className)}
      ref={forwardedRef}
    >
      {children}
    </div>
  );
});
