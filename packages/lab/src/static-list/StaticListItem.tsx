import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import staticListItemCss from "./StaticListItem.css";

const withBaseName = makePrefixer("saltStaticListItem");

export interface StaticListItemProps extends ComponentPropsWithoutRef<"li"> {
  /**
   *  To pass a divider to separate the List items. Defaults to false.
   */
  divider?: boolean;
}

export const StaticListItem = forwardRef<HTMLLIElement, StaticListItemProps>(
  function TrackerStep(props, ref) {
    const { className, children, divider = false, ...restProps } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-static-list-item",
      css: staticListItemCss,
      window: targetWindow,
    });

    return (
      <li
        className={clsx(
          withBaseName(),
          {
            [withBaseName("divided")]: divider,
          },
          className,
        )}
        ref={ref}
        {...restProps}
      >
        {children}
      </li>
    );
  },
);
