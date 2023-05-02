import {
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import {
  makePrefixer,
  StatusIndicator,
  useAriaAnnouncer,
  useControlled,
  useForkRef,
  ValidationStatus,
} from "@salt-ds/core";

import getInnerText from "./internal/getInnerText";
import { clsx } from "clsx";

import "./Banner.css";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Announcement message for screen reader 250ms after the banner is mounted.
   */
  announcement?: string;
  /**
   * If true, the built-in ARIA announcer will be disabled
   */
  disableAnnouncer?: boolean;
  /**
   * Emphasize the styling by applying a background color: defaults to false
   */
  emphasize?: boolean;
  /**
   * onClose callback when the close icon is clicked, the dismiss button will not be rendered if this is
   * not defined
   */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   *  A string to determine the current state of the Banner
   */
  status?: ValidationStatus;
  open?: boolean;
}

const withBaseName = makePrefixer("saltBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    announcement: announcementProp,
    children,
    className,
    disableAnnouncer = false,
    emphasize = false,
    onClose: onCloseProp,
    open = true,
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
    <>
      {open && (
        <div
          className={clsx(withBaseName(), withBaseName(status), className, {
            [withBaseName("emphasize")]: emphasize,
          })}
          ref={handleRef}
          {...rest}
        >
          <StatusIndicator
            className={clsx(withBaseName("icon"), className)}
            status={status}
          />
          {children}
        </div>
      )}
    </>
  );
});
