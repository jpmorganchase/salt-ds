import { type ComponentType, useEffect } from "react";
import type { AnnounceFnOptions } from "./AriaAnnouncerContext";
import { useAriaAnnouncer } from "./useAriaAnnouncer";

export interface AriaAnnounceProps extends AnnounceFnOptions {
  /**
   * String to be announced by screenreader.
   */
  announcement?: string;
  /**
   * Legacy option, precede the announcement with a delay.
   * @deprecated
   * useAriaAnnouncer `delay` arg is deprecated, use your own `setTimeout` or consider using `duration` through `AnnounceFnOptions` instead.
   */
  delay?: number;
}

export const AriaAnnounce: ComponentType<AriaAnnounceProps> = ({
  announcement,
  delay,
  ...rest
}) => {
  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (announcement) {
      if (delay !== undefined) {
        announce(announcement, delay);
      }
      announce(announcement, rest);
    }
  }, [announce, announcement]);

  // biome-ignore lint/complexity/noUselessFragments: If we return null here, react-docgen wouldn't be able to locate the component.
  return <></>;
};
