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
  type CSSProperties,
  type DetailedHTMLProps,
  Fragment,
  type HTMLAttributes,
} from "react";

import "./QAContainer.css";

const withBaseName = makePrefixer("saltQAContainer");

export interface QAContainerProps extends HTMLAttributes<HTMLDivElement> {
  cols?: number;
  height?: number;
  enableStyleInjection?: boolean;
  itemPadding?: number;
  itemWidthAuto?: boolean;
  transposeDensity?: boolean;
  vertical?: boolean;
  width?: number;
}

const BackgroundBlock = ({
  background = "rgb(36, 37, 38)",
  children,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  background?: string;
}) => (
  <div
    className="background-block"
    style={{
      background,
    }}
  >
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
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  mode: Mode;
}) => {
  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <BackgroundBlock background={mode === "light" ? "white" : undefined}>
      {DensityValues.map((d) => (
        <ChosenSaltProvider mode={mode} density={d} key={d}>
          <div className="background-item-wrapper">{children}</div>
        </ChosenSaltProvider>
      ))}
    </BackgroundBlock>
  );
};

export const QAContainer = ({
  children,
  className,
  cols = 3,
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
            <DensityBlock key={i} mode="light">
              {child}
            </DensityBlock>
          ))}
          {Children.map(children, (child, i) => (
            <DensityBlock key={i} mode="dark">
              {child}
            </DensityBlock>
          ))}
        </>
      ) : (
        DensityValues.map((d) => (
          <Fragment key={d}>
            <ChosenSaltProvider
              mode="light"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock background="white">{children}</BackgroundBlock>
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
