import { DensityValues, SaltProvider } from "@salt-ds/core";
import { Fragment, type ReactElement, cloneElement } from "react";
import { BackgroundBlock } from "./BackgroundBlock";
import { DocGrid } from "./DocGrid";

/**
 * Helper component to render a component in all density and theme for Visual Regression tests
 *
 * Sample usage:
 * ```
 * <AllRenderer Component={Panel} props={{ ...props }} >
 *    <Panel {...props}>
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
      {DensityValues.map((d) => {
        return (
          <Fragment key={d}>
            <SaltProvider
              density={d}
              mode="light"
              key={`theme-light-${d}`}
              applyClassesTo={"child"}
            >
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </SaltProvider>
            <SaltProvider
              applyClassesTo={"child"}
              density={d}
              mode="dark"
              key={`theme-dark-${d}`}
            >
              <BackgroundBlock>{cloneElement(children)}</BackgroundBlock>
            </SaltProvider>
          </Fragment>
        );
      })}
    </DocGrid>
  );
};
