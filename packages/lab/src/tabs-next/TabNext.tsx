import { makePrefixer } from "@salt-ds/core";
import {
  forwardRef,
  ForwardedRef,
  MouseEvent,
  ReactElement,
  useCallback,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TabProps } from "./TabsNextTypes";

import tabCss from "./TabNext.css";
import clsx from "clsx";

const withBaseName = makePrefixer("saltTabNext");

export const TabNext = forwardRef(function Tab(
  {
    children,
    className,
    index,
    value,
    label,
    onClick,
    onKeyDown,
    onKeyUp,
    selected,
    tabIndex,
    ...props
  }: TabProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement<TabProps> {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next",
    css: tabCss,
    window: targetWindow,
  });
  if (index === undefined || onClick === undefined || onKeyDown === undefined) {
    throw new Error(
      "index, onClick, onKeyDown are required props, they would normally be injected by Tabstrip, are you creating a Tab outside of a Tabstrip"
    );
  }
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    onClick(e, index);
  };

  return (
    <div
      {...props}
      className={clsx(withBaseName(), className)}
      aria-selected={selected}
      data-value={value}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      ref={ref}
      role="tab"
      tabIndex={tabIndex}
    >
      <div className={withBaseName("main")}>
        <span
          className={withBaseName("text")}
          // data-text is important, it determines the width of the tab. A pseudo
          // element assigns data-text as content. This is styled as selected tab
          // text. That means width of tab always corresponds to its selected state,
          // so tabs do not change size when selected (ie when the text is bolded).
          data-text={label}
        >
          {children}
        </span>
      </div>
    </div>
  );
});
