import { cloneElement, Fragment, ReactElement } from "react";
import { DensityValues, ToolkitProvider } from "@jpmorganchase/uitk-core";
import { DocGrid } from "./DocGrid";
import { BackgroundBlock } from "./BackgroundBlock";

/**
 * Helper component to render a component in all density and theme for Visual Regression tests
 *
 * Sample usage:
 * ```
 * <AllRenderer Component={Panel} props={{ ...props }} >
 *    <Panel className="uitkEmphasisLow" {...props}>
 *       Lorem Ipsum
 *    </Panel>
 * </AllRenderer>
 * ```
 */

export const AllRenderer = ({
  children,
  className,
}: {
  children: ReactElement;
  className?: string;
}): JSX.Element => {
  return (
    <DocGrid className={className}>
      {DensityValues.map((d, i) => {
        return (
          <Fragment key={i}>
            <ToolkitProvider
              density={d}
              mode="light"
              key={"theme-light-" + d}
              applyClassesTo={"child"}
            >
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </ToolkitProvider>
            <ToolkitProvider
              applyClassesTo={"child"}
              density={d}
              mode="dark"
              key={"theme-dark-" + d}
            >
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </ToolkitProvider>
          </Fragment>
        );
      })}
    </DocGrid>
  );
};
