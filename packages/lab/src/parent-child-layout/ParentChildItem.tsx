import { forwardRef } from "react";
import { clsx } from "clsx";
import { FlexItem, FlexItemProps, makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import parentChildItemCss from "./ParentChildItem.css";

export interface ParentChildItemProps extends FlexItemProps<"div"> {
  /**
   * Determines whether the component is stacked
   */
  isStacked?: boolean;
}

const withBaseName = makePrefixer("saltParentChildItem");

export const ParentChildItem = forwardRef<HTMLDivElement, ParentChildItemProps>(
  function ParentChildItem({ isStacked, children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-parent-child-item",
      css: parentChildItemCss,
      window: targetWindow,
    });

    return (
      <FlexItem
        className={clsx(
          withBaseName(),
          {
            "saltFlexItem-stacked": isStacked,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexItem>
    );
  }
);
