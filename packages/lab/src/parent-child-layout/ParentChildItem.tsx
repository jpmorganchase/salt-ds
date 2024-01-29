import { clsx } from "clsx";
import { FlexItem, FlexItemProps } from "@salt-ds/core";

export interface ParentChildItemProps extends FlexItemProps<"div"> {
  /**
   * Determines whether the component is stacked
   */
  isStacked?: boolean;
}

export const ParentChildItem = ({
  isStacked,
  children,
  className,
  ...rest
}: ParentChildItemProps) => (
  <FlexItem
    className={clsx(
      {
        ["saltFlexItem-stacked"]: isStacked,
      },
      className
    )}
    {...rest}
  >
    {children}
  </FlexItem>
);
