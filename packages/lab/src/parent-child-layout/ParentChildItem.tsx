import { clsx } from "clsx";
import { FlexItem, FlexItemProps } from "@salt-ds/core";

export interface ParentChildItemProps extends FlexItemProps<"div"> {
  /**
   * Determines whether the component is stacked
   */
  isCollapsed?: boolean;
}

export const ParentChildItem = ({
  isCollapsed,
  children,
  className,
  ...rest
}: ParentChildItemProps) => (
  <FlexItem
    className={clsx(
      {
        ["saltFlexItem-stacked"]: isCollapsed,
      },
      className
    )}
    {...rest}
  >
    {children}
  </FlexItem>
);
