import {Children, forwardRef} from "react";
import {FlexLayout} from "../FlexLayout";
import {FlexLayoutProps} from "../types";
import {FlexItem} from "../FlexItem";
import "./SplitLayout.css";
import {makePrefixer} from "@jpmorganchase/uitk-core";

export interface SplitLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps['align'];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps['gap'];
  /**
   * Item after which elements will be placed on the right hand split area.
   */
  splitAfterN?: number;
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps['separators'];
  /**
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: FlexLayoutProps['wrap'];
}

const withBaseName = makePrefixer("uitkSplitLayout");

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {align, children, gap, separators, wrap = true, splitAfterN, ...rest},
    ref
  ) {
    const divideFromItem =
      splitAfterN || Math.ceil(Children.count(children) / 2);

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
