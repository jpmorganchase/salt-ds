import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from "react";

import staticListCss from "./StaticList.css";

const withBaseName = makePrefixer("saltStaticList");

export interface StaticListProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * Should be one or more components
   */
  children: ReactNode;
}

export const StaticList = forwardRef<HTMLUListElement, StaticListProps>(
  function StaticList(
    { children, className, ...restProps },
    ref,
  ): ReactElement<StaticListProps> {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-static-list",
      css: staticListCss,
      window: targetWindow,
    });

    return (
      <ul className={clsx(withBaseName(), className)} ref={ref} {...restProps}>
        {children}
      </ul>
    );
  },
);
