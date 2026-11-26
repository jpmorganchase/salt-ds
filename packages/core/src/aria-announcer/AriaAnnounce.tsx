import { type ComponentType, useEffect } from "react";
import type { AnnounceFnOptions } from "./AriaAnnouncerContext";
import { useAriaAnnouncer } from "./useAriaAnnouncer";

/**
 * @deprecated Use `useAriaAnnouncer` instead. Its announcement options use `AnnounceFnOptions`.
 */
export interface AriaAnnounceProps extends AnnounceFnOptions {
  /**
   * String to be announced by screenreader.
   */
  announcement?: string;
  /**
   * Legacy option, precede the announcement with a delay.
   * @deprecated since 1.60.0. Use your own `setTimeout`, or use `duration` instead.
   */
  delay?: number;
}

/**
 * @deprecated Use `useAriaAnnouncer` to announce from event handlers or effects instead.
 */
export const AriaAnnounce: ComponentType<AriaAnnounceProps> = ({
  announcement,
  delay,
  ariaLive,
  duration,
  target,
}) => {
  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (announcement) {
      if (delay !== undefined) {
        announce(announcement, delay);
      } else {
        announce(announcement, {
          ...(ariaLive ? { ariaLive } : {}),
          ...(duration !== undefined ? { duration } : {}),
          ...(target ? { target } : {}),
        });
      }
    }
  }, [announce, announcement, ariaLive, delay, duration, target]);

  // biome-ignore lint/complexity/noUselessFragments: If we return null here, react-docgen wouldn't be able to locate the component.
  return <></>;
};
