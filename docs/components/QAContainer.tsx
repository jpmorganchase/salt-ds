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
}: ComponentPropsWithoutRef<"div"> & {
  mode: Mode;
}) => {
  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <ChosenSaltProvider mode={mode}>
      <BackgroundBlock>
        {DensityValues.map((d) => (
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
    "--qaContainer-height": height === undefined ? "auto" : `${height}px`,
    "--qaContainer-width": width === undefined ? "auto" : `${width}px`,
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
