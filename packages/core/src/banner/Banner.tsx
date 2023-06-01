import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "../utils";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import bannerCss from "./Banner.css";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Emphasize the styling by applying a background color: defaults to false
   */
  variant?: "primary" | "secondary";
  /**
   *  A string to determine the current state of the Banner
   */
  status?: ValidationStatus;
}

const withBaseName = makePrefixer("saltBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { children, className, variant = "primary", status = "info", ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-banner",
    css: bannerCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName(status),
        withBaseName(variant),
        className
      )}
      ref={ref}
      {...rest}
      aria-live="polite"
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});
