import { forwardRef } from "react";
import { FlexLayout } from "../FlexLayout";
import { FlexLayoutProps } from "../types";

export type FlowLayoutProps = Omit<FlexLayoutProps, "direction" | "wrap">;

export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ children, ...rest }, ref) {
    return (
      <FlexLayout direction="row" ref={ref} wrap={true} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
