import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import staticListItemCss from "./StaticListItem.css";

const withBaseName = makePrefixer("saltStaticListItem");

export interface StaticListItemProps extends ComponentPropsWithoutRef<"li"> {}

export const StaticListItem = forwardRef<HTMLLIElement, StaticListItemProps>(
  function StaticListItem(props, ref) {
    const { className, children, ...restProps } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-static-list-item",
      css: staticListItemCss,
      window: targetWindow,
    });

    return (
      <li className={clsx(withBaseName(), className)} ref={ref} {...restProps}>
        {children}
      </li>
    );
  },
);
