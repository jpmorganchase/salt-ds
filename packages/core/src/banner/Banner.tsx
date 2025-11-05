import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";

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
  ref,
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
        className,
      )}
      ref={ref}
      {...rest}
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});
