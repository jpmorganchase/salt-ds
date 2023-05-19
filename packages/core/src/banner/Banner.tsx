import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "../utils";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { clsx } from "clsx";

import "./Banner.css";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Emphasize the styling by applying a background color: defaults to false
   */
  emphasize?: boolean;
  /**
   *  A string to determine the current state of the Banner
   */
  status?: ValidationStatus;
}

const withBaseName = makePrefixer("saltBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    children,
    className,
    emphasize = false,
    status = "info",
    ...rest
  },
  ref
) {

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className, {
        [withBaseName("emphasize")]: emphasize,
      })}
      ref={ref}
      role="banner"
      {...rest}
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});
