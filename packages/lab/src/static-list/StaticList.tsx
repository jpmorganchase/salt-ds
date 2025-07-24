import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import staticListCss from "./StaticList.css";

const withBaseName = makePrefixer("saltStaticList");

export interface StaticListProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * The list items to be rendered within the StaticList.
   */
  children: ReactNode;
}

export const StaticList = forwardRef<HTMLOListElement, StaticListProps>(
  function StaticList({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-static-list",
      css: staticListCss,
      window: targetWindow,
    });

    return (
      <ol className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </ol>
    );
  },
);
