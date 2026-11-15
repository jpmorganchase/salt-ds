/** biome-ignore-all lint/suspicious/noArrayIndexKey: Only used in QA stories */
import {
  type Mode,
  makePrefixer,
  SaltProvider,
  SaltProviderNext,
  useTheme,
} from "@salt-ds/core";
import mobileInterimCss from "@salt-ds/theme/css/experimental/mobile-interim.css?inline";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  Fragment,
  type ReactNode,
  useInsertionEffect,
} from "react";

import "./QAContainer.css";

const withBaseName = makePrefixer("saltQAContainer");

export const QADensities = [
  "high",
  "medium",
  "low",
  "touch",
  "mobile-interim",
] as const;

export type QADensity = (typeof QADensities)[number];

const mobileInterimClassName = withBaseName("mobileInterim");
const mobileInterimStyleId = withBaseName("mobileInterimStyles");

// The experimental stylesheet targets every mobile density element, so it's scoped to a class only Mobile (Interim) providers carry.
// Otherwise it would also restyle any mobile density in the same story.
const scopedMobileInterimCss = mobileInterimCss.replaceAll(
  ".salt-density-mobile",
  `.salt-density-mobile.${mobileInterimClassName}`,
);

function useMobileInterimStyles(enabled: boolean) {
  useInsertionEffect(() => {
    if (!enabled || document.getElementById(mobileInterimStyleId)) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = mobileInterimStyleId;
    styleElement.textContent = scopedMobileInterimCss;
    document.head.append(styleElement);
  }, [enabled]);
}

export interface QADensityProviderProps {
  children: ReactNode;
  density: QADensity;
  enableStyleInjection?: boolean;
  mode?: Mode;
}

/**
 * A `SaltProvider` for a QA density. Mobile (Interim) renders mobile density plus a theme class, which floating UI inherits.
 */
export const QADensityProvider = ({
  children,
  density,
  enableStyleInjection,
  mode,
}: QADensityProviderProps) => {
  const { theme, themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;
  const isMobileInterim = density === "mobile-interim";
  useMobileInterimStyles(isMobileInterim);

  return (
    <ChosenSaltProvider
      density={isMobileInterim ? "mobile" : density}
      enableStyleInjection={enableStyleInjection}
      mode={mode}
      theme={isMobileInterim ? clsx(theme, mobileInterimClassName) : undefined}
    >
      {children}
    </ChosenSaltProvider>
  );
};

export interface QAContainerProps extends ComponentPropsWithoutRef<"div"> {
  cols?: number;
  densities?: QADensity[];
  height?: number | string;
  enableStyleInjection?: boolean;
  itemPadding?: number;
  itemWidthAuto?: boolean;
  transposeDensity?: boolean;
  vertical?: boolean;
  width?: number | string;
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
          <QADensityProvider mode={mode} density={d} key={d}>
            <div className="background-item-wrapper">{children}</div>
          </QADensityProvider>
        ))}
      </BackgroundBlock>
    </ChosenSaltProvider>
  );
};

export const QAContainer = ({
  children,
  className,
  cols = 3,
  densities = [...QADensities],
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
    "--qaContainer-height":
      height === undefined
        ? undefined
        : typeof height === "number"
          ? `${height}px`
          : height,
    "--qaContainer-width":
      width === undefined
        ? undefined
        : typeof width === "number"
          ? `${width}px`
          : width,
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
            <QADensityProvider
              mode="light"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock>{children}</BackgroundBlock>
            </QADensityProvider>
            <QADensityProvider
              mode="dark"
              density={d}
              enableStyleInjection={enableStyleInjection}
            >
              <BackgroundBlock>{children}</BackgroundBlock>
            </QADensityProvider>
          </Fragment>
        ))
      )}
    </div>
  );
};
