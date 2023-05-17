import { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import {
  makePrefixer,
  StatusIndicator,
  useAriaAnnouncer,
  useForkRef,
  ValidationStatus,
} from "@salt-ds/core";
import { clsx } from "clsx";

import getInnerText from "./internal/getInnerText";
import "./Banner.css";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Announcement message for screen reader 250ms after the banner is mounted.
   */
  announcement?: string;
  /**
   * If false, the built-in ARIA announcer will be applied. If true, the default browser behaviour will be applied instead.
   */
  disableAnnouncer?: boolean;
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
    announcement: announcementProp,
    disableAnnouncer = true,
    children,
    className,
    emphasize = false,
    status = "info",
    ...rest
  },
  ref
) {
  const { announce } = useAriaAnnouncer();

  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null
  );

  const handleRef = useForkRef<HTMLDivElement>(setContainerNode, ref);

  useEffect(() => {
    if (!disableAnnouncer && containerNode) {
      const announcement = announcementProp || getInnerText(containerNode);
      announce(announcement, 250);
    }
  }, [announce, disableAnnouncer, containerNode, announcementProp]);

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className, {
        [withBaseName("emphasize")]: emphasize,
      })}
      ref={handleRef}
      {...rest}
      aria-live="polite"
    >
      <StatusIndicator status={status} />
      {children}
    </div>
  );
});
