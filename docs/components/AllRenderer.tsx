import { cloneElement, Fragment, ReactElement } from "react";
import { DensityValues, ToolkitProvider } from "@brandname/core";
import { DocGrid } from "./DocGrid";
import { BackgroundBlock } from "./BackgroundBlock";

/**
 * Helper component to render a component in all density and theme for Visual Regression tests
 *
 * Sample usage:
 * ```
 * <AllRenderer Component={Panel} props={{ emphasis: "low", ...props }} >
 *    <Panel emphasis="low" {...props}>
 *       Lorem Ipsum
 *    </Panel>
 * </AllRenderer>
 * ```
 */

export const AllRenderer = ({ children }: { children: ReactElement }) => {
  return (
    <DocGrid>
      {DensityValues.map((d, i) => {
        return (
          <Fragment key={i}>
            <ToolkitProvider
              density={d}
              theme="light"
              key={"theme-light-" + d}
              applyClassesToChild
            >
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </ToolkitProvider>
            <ToolkitProvider density={d} theme="dark" key={"theme-dark-" + d}>
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </ToolkitProvider>
          </Fragment>
        );
      })}
    </DocGrid>
  );
};
