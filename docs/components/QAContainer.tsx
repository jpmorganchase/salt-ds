import { makePrefixer, Mode, ToolkitProvider } from "@salt-ds/core";
import cx from "classnames";
import {
  Children,
  CSSProperties,
  DetailedHTMLProps,
  Fragment,
  HTMLAttributes,
} from "react";
import { DraggableImg } from "./DraggableSnapshot";

import "./QAContainer.css";

const withBaseName = makePrefixer("uitkQAContainer");

export interface QAContainerProps extends HTMLAttributes<HTMLDivElement> {
  cols?: number;
  height?: number;
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
      <ToolkitProvider mode={mode} density={d} key={i}>
        <div className="background-item-wrapper">{children}</div>
      </ToolkitProvider>
    ))}
  </BackgroundBlock>
);

export const QAContainer = ({
  children,
  className,
  cols = 3,
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
      className={cx(withBaseName(), className, {
        "uitkQAContainer-vertical": vertical,
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
            <ToolkitProvider mode="light" density={d}>
              <BackgroundBlock background="white">{children}</BackgroundBlock>
            </ToolkitProvider>
            <ToolkitProvider mode="dark" density={d}>
              <BackgroundBlock>{children}</BackgroundBlock>
            </ToolkitProvider>
          </Fragment>
        ))
      )}
      {imgSrc && <DraggableImg src={imgSrc} style={style} />}
    </div>
  );
};
