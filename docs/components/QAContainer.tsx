import { makePrefixer, Mode, SaltProvider } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  Children,
  CSSProperties,
  DetailedHTMLProps,
  Fragment,
  HTMLAttributes,
} from "react";
import { DraggableImg } from "./DraggableSnapshot";

import "./QAContainer.css";

const withBaseName = makePrefixer("saltQAContainer");

export interface QAContainerProps extends HTMLAttributes<HTMLDivElement> {
  cols?: number;
  height?: number;
  enableStyleInjection?: boolean;
  imgSrc?: string;
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
}: DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  mode: Mode;
}) => (
  <BackgroundBlock background={mode === "light" ? "white" : undefined}>
    {DensityValues.map((d, i) => (
      <SaltProvider mode={mode} density={d} key={i}>
        <div className="background-item-wrapper">{children}</div>
      </SaltProvider>
    ))}
  </BackgroundBlock>
);

export const QAContainer = ({
  children,
  className,
  cols = 3,
  enableStyleInjection = true,
  height,
  itemPadding,
  itemWidthAuto,
  imgSrc,
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
        DensityValues.map((d, i) => (
          <Fragment key={i}>
            <SaltProvider
              mode="light"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock background="white">{children}</BackgroundBlock>
            </SaltProvider>
            <SaltProvider
              mode="dark"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock>{children}</BackgroundBlock>
            </SaltProvider>
          </Fragment>
        ))
      )}
      {imgSrc && <DraggableImg src={imgSrc} style={style} />}
    </div>
  );
};
