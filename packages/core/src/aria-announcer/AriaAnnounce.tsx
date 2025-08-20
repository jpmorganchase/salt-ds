import { type ComponentType, useEffect } from "react";

import { useAriaAnnouncer } from "./useAriaAnnouncer";

export interface AriaAnnounceProps {
  /**
   * String which will be announced by screen readers on change
   */
  announcement?: string;
}

export const AriaAnnounce: ComponentType<AriaAnnounceProps> = ({
  announcement,
}) => {
  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (announcement) {
      announce(announcement);
    }
  }, [announce, announcement]);

  // biome-ignore lint/complexity/noUselessFragments: If we return null here, react-docgen wouldn't be able to locate the component.
  return <></>;
};
