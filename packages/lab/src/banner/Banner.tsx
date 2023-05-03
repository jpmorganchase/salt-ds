import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  makePrefixer,
  StatusIndicator,
  useAriaAnnouncer,
  useForkRef,
  ValidationStatus,
} from "@salt-ds/core";

import getInnerText from "./internal/getInnerText";
import { clsx } from "clsx";
import { BannerContext } from "./BannerContext";

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
    open: openProp = true,
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

  const [open, setOpen] = useState<boolean>(openProp)

  const onClose = (openContext: boolean) => {
    setOpen(openContext)
  }

  return (
    <BannerContext.Provider value={{ onClose }}>
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
    </BannerContext.Provider>
  );
});
