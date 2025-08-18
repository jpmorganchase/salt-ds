/** biome-ignore-all lint/suspicious/noArrayIndexKey: Only used in QA stories */
import {
  type Mode,
  makePrefixer,
  SaltProvider,
  SaltProviderNext,
  useTheme,
} from "@salt-ds/core";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  Fragment,
} from "react";

import "./QAContainer.css";

const withBaseName = makePrefixer("saltQAContainer");

export interface QAContainerProps extends ComponentPropsWithoutRef<"div"> {
  cols?: number;
  densities?: Array<(typeof DensityValues)[number]>;
  height?: number;
  enableStyleInjection?: boolean;
  itemPadding?: number;
  itemWidthAuto?: boolean;
  transposeDensity?: boolean;
  vertical?: boolean;
  width?: number;
}

const BackgroundBlock = ({ children }: ComponentPropsWithoutRef<"div">) => (
  <div className="background-block">
    {Children.map(children, (child, i) => (
      <div className="background-item-wrapper" key={i}>
        {child}
      </div>
    ))}
  </div>
);

const DensityValues = ["high", "medium", "low", "touch"] as const;

const DensityBlock = ({
  mode,
  children,
  densities = [],
}: ComponentPropsWithoutRef<"div"> & {
  densities: QAContainerProps["densities"];
  mode: Mode;
}) => {
  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <ChosenSaltProvider mode={mode}>
      <BackgroundBlock>
        {densities.map((d) => (
          <ChosenSaltProvider mode={mode} density={d} key={d}>
            <div className="background-item-wrapper">{children}</div>
          </ChosenSaltProvider>
        ))}
      </BackgroundBlock>
    </ChosenSaltProvider>
  );
};

export const QAContainer = ({
  children,
  className,
  cols = 3,
  densities = ["high", "medium", "low", "touch"],
  enableStyleInjection = true,
  height,
  itemPadding,
  itemWidthAuto,
  transposeDensity,
  vertical,
  width,
  ...htmlAttributes
}: QAContainerProps) => {
  const style = {
    "--qaContainer-cols": cols,
    "--qaContainer-height": height === undefined ? undefined : `${height}px`,
    "--qaContainer-width": width === undefined ? undefined : `${width}px`,
    "--qaContainer-item-padding":
      itemPadding === undefined ? undefined : `${itemPadding}px`,
    "--qaContainer-item-width": itemWidthAuto ? "auto" : undefined,
  } as CSSProperties;

  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <div
      {...htmlAttributes}
      className={clsx(withBaseName(), className, {
        "saltQAContainer-vertical": vertical,
      })}
      style={style}
    >
      {transposeDensity ? (
        <>
          {Children.map(children, (child, i) => (
            <DensityBlock key={i} mode="light" densities={densities}>
              {child}
            </DensityBlock>
          ))}
          {Children.map(children, (child, i) => (
            <DensityBlock key={i} mode="dark" densities={densities}>
              {child}
            </DensityBlock>
          ))}
        </>
      ) : (
        densities.map((d) => (
          <Fragment key={d}>
            <ChosenSaltProvider
              mode="light"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock>{children}</BackgroundBlock>
            </ChosenSaltProvider>
            <ChosenSaltProvider
              mode="dark"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock>{children}</BackgroundBlock>
            </ChosenSaltProvider>
          </Fragment>
        ))
      )}
    </div>
  );
};
