import { forwardRef, HTMLAttributes, MouseEvent, useState } from "react";
import { makePrefixer, StatusIndicator, ValidationStatus } from "@salt-ds/core";

import { clsx } from "clsx";
import { BannerContext } from "./BannerContext";

import "./Banner.css";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Announcement message for screen reader 250ms after the banner is mounted.
   */
  // announcement?: string;
  /**
   * If true, the built-in ARIA announcer will be disabled
   */
  // disableAnnouncer?: boolean;
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
    // announcement: announcementProp,
    // disableAnnouncer = false,
    children,
    className,
    emphasize = false,
    status = "info",
    ...rest
  },
  ref
) {
  const [open, setOpen] = useState(true);

  const onClose = (e: MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
  };

  return (
    <BannerContext.Provider value={{ onClose }}>
      {open && (
        <div
          className={clsx(withBaseName(), withBaseName(status), className, {
            [withBaseName("emphasize")]: emphasize,
          })}
          ref={ref}
          {...rest}
          aria-live="polite"
        >
          <StatusIndicator
            className={clsx(withBaseName("icon"), className)}
            status={status}
          />
          {children}
        </div>
      )}
    </BannerContext.Provider>
  );
});
