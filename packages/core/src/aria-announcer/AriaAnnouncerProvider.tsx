import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  FC,
  CSSProperties,
} from "react";

import { AriaAnnouncerContext } from "./AriaAnnouncerContext";

export const DELAY = 150;

export interface AriaAnnouncerProviderProps {
  /**
   * Style overrides for the aria-live element
   */
  style?: CSSProperties;
}

export const AriaAnnouncerProvider: FC<AriaAnnouncerProviderProps> = ({
  children,
  style,
}) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");
  const announcementsRef = useRef<string[]>([]);
  const isAnnouncingRef = useRef(false);
  const mountedRef = useRef(true);

  const announceAll = useCallback(() => {
    isAnnouncingRef.current = true;
    if (announcementsRef.current.length && mountedRef.current) {
      setCurrentAnnouncement("");
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const [announcement, ...restAnnouncements] = announcementsRef.current;
          announcementsRef.current = restAnnouncements;
          setCurrentAnnouncement(announcement);
          setTimeout(() => {
            announceAll();
          }, DELAY);
        }
      });
    } else {
      isAnnouncingRef.current = false;
    }
  }, []);

  const announce = useCallback(
    (announcement) => {
      announcementsRef.current = announcementsRef.current.concat(announcement);
      if (!isAnnouncingRef.current) {
        announceAll();
      }
    },
    [announceAll]
  );

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AriaAnnouncerContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live="assertive"
        // hidden styling based on https://webaim.org/techniques/css/invisiblecontent/
        style={{
          clip: "rect(1px, 1px, 1px, 1px)",
          clipPath: "inset(50%)",
          height: 1,
          width: 1,
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          ...style,
        }}
      >
        {currentAnnouncement}
      </div>
    </AriaAnnouncerContext.Provider>
  );
};
