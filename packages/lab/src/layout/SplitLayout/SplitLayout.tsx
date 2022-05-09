import { Children, forwardRef } from "react";
import { FlexAlignment, FlexLayout } from "../FlexLayout";
import { ResponsiveProp } from "../../utils";
import { LayoutSeparator } from "../types";
import { FlexItem } from "../FlexItem";
import "./SplitLayout.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

export interface SplitLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexAlignment | "stretch" | "baseline";
  /**
   * Controls the space between items.
   */
  gap?: ResponsiveProp<number>;
  /**
   * Index of the first item to push right on the split layout.
   */
  pushRight?: number;
  /**
   * Adds a separator between elements.
   */
  separators?: LayoutSeparator | true;
  /**
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: ResponsiveProp<boolean>;
}

const withBaseName = makePrefixer("uitkSplitLayout");

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    { align, children, gap, separators, wrap = true, pushRight, ...rest },
    ref
  ) {
    const divideFromItem =
      pushRight || Math.floor(Children.count(children) / 2);

    const SideSplit = (side: "left" | "right") => {
      const splitter =
        side === "left"
          ? (i: number) => i <= divideFromItem - 1
          : (i: number) => i > divideFromItem - 1;
      return (
        <FlexLayout
          align={align}
          gap={gap}
          separators={separators}
          className={withBaseName(`${side}-split`)}
        >
          {Children.map(children, (child, index) => {
            return splitter(index) ? <FlexItem>{child}</FlexItem> : null;
          })}
        </FlexLayout>
      );
    };

    return (
      <FlexLayout
        direction="row"
        ref={ref}
        wrap={wrap}
        {...rest}
        className={withBaseName()}
      >
        {SideSplit("left")}
        {SideSplit("right")}
      </FlexLayout>
    );
  }
);
