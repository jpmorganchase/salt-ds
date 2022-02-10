import {
  Children,
  CSSProperties,
  FC,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useMemo,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@brandname/core";
import { FlexLayout, FlexLayoutProps } from "../FlexLayout";
import { FlexItem, FlexItemProps } from "../FlexItem";

const withBaseName = makePrefixer("uitkPanelledLayout");

export interface PanelledLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Custom styles
   */
  style?: CSSProperties;
  /**
   * Flex item components to be rendered.
   */
  children: ReactElement<FlexItemProps>[];
}

interface PanelFlexLayoutProps extends FlexLayoutProps {
  ref?: ForwardedRef<HTMLDivElement>;
}

export const PanelFlexLayout: FC<PanelFlexLayoutProps> = ({
  children,
  ...rest
}) => (
  <FlexLayout splitter wrap="nowrap" height="100%" {...rest}>
    {children}
  </FlexLayout>
);

const areas = ["left", "topRight", "bottomRight", "bottom"];

export const PanelledLayout = forwardRef<HTMLDivElement, PanelledLayoutProps>(
  function PanelledLayout({ children, className, style, ...rest }, ref) {
    const panels = useMemo(
      () =>
        Object.assign(
          {},
          ...Children.map(
            children,
            (child: ReactElement<FlexItemProps>, index) => ({
              [areas[index]]: child, // assign each panel area to a child
            })
          )
        ),
      [children]
    );

    const { left, topRight, bottomRight, bottom } = panels;

    return (
      <PanelFlexLayout
        direction="column"
        className={cx(className, withBaseName())}
        style={style}
        ref={ref}
        {...rest}
      >
        <FlexItem resizeable>
          <PanelFlexLayout direction="row">
            <FlexItem resizeable>{left}</FlexItem>
            <FlexItem resizeable>
              <PanelFlexLayout direction="column">
                <FlexItem resizeable>{topRight}</FlexItem>
                <FlexItem resizeable>{bottomRight}</FlexItem>
              </PanelFlexLayout>
            </FlexItem>
          </PanelFlexLayout>
        </FlexItem>
        <FlexItem resizeable>{bottom}</FlexItem>
      </PanelFlexLayout>
    );
  }
);
