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

export const ARIA_ANNOUNCE_DELAY = 150;

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
  // announcement that gets rendered inside aria-live and read out by screen readers
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");
  // queue that stores all the requested announcements
  const announcementsRef = useRef<string[]>([]);
  // we use this variable to decide whether to start the announcement queue if one is not already in progress
  const isAnnouncingRef = useRef(false);
  // we need to keep track of the state of the component mount since all the async function calls
  // might trigger a setState after a component has been unmounted
  const mountedRef = useRef(true);

  // announceAll will get called recursively until all the announcements are rendered and cleared from the queue
  const announceAll = useCallback(() => {
    isAnnouncingRef.current = true;
    if (announcementsRef.current.length && mountedRef.current) {
      setCurrentAnnouncement("");
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const announcement = announcementsRef.current.shift() as string;
          setCurrentAnnouncement(announcement);
          setTimeout(() => {
            announceAll();
          }, ARIA_ANNOUNCE_DELAY);
        }
      });
    } else {
      isAnnouncingRef.current = false;
    }
  }, []);

  const announce = useCallback(
    (announcement) => {
      announcementsRef.current.push(announcement);
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
        // hidden styling based on https://tailwindcss.com/docs/screen-readers
        style={{
          position: "absolute",
          height: 1,
          width: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
          ...style,
        }}
      >
        {currentAnnouncement}
      </div>
    </AriaAnnouncerContext.Provider>
  );
};
