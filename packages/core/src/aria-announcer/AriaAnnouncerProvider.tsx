import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type AnnounceFnOptions,
  AriaAnnouncerContext,
} from "./AriaAnnouncerContext";

export const ARIA_ANNOUNCE_DELAY = 150; // time between DOM updates
export const DEFAULT_ANNOUNCEMENT_DURATION = 500; // time between announcements

/**
 * TODO add forwardRef at a breaking change
 */
export interface AriaAnnouncerProviderProps
  extends ComponentPropsWithRef<"div"> {}

interface AnnouncementItem extends AnnounceFnOptions {
  /**
   * concise announcement message.
   */
  announcement: string;
}

export function AriaAnnouncerProvider({
  children,
  style,
  ...rest
}: AriaAnnouncerProviderProps) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");
  const [ariaLive, setAriaLive] = useState<AnnounceFnOptions["ariaLive"]>();

  const announcementsRef = useRef<AnnouncementItem[]>([]);
  const isAnnouncingRef = useRef(false);
  const mountedRef = useRef(true);

  const clearAnnouncement = () => {
    setCurrentAnnouncement("");
  };

  const makeAnnouncement = (
    announcement: string,
    ariaLive: AnnounceFnOptions["ariaLive"],
  ) => {
    setAriaLive(ariaLive);
    setCurrentAnnouncement(announcement);
  };

  /** Each announcement has a minimum duration */
  const processNextAnnouncement = () => {
    if (!mountedRef.current || !announcementsRef.current.length) {
      isAnnouncingRef.current = false;
      return;
    }
    const {
      announcement,
      duration = DEFAULT_ANNOUNCEMENT_DURATION,
      ariaLive = "assertive",
    } = announcementsRef.current.shift() as AnnouncementItem;
    makeAnnouncement(announcement, ariaLive);
    setTimeout(() => {
      clearAnnouncement();
      setTimeout(announceAll, ARIA_ANNOUNCE_DELAY);
    }, duration);
  };

  const announceAll = useCallback(() => {
    isAnnouncingRef.current = true;
    requestAnimationFrame(processNextAnnouncement);
  }, []);

  /** TODO Legacy code would delay before announcement, remove as a breaking change */
  const announceAllLegacy = useCallback(() => {
    isAnnouncingRef.current = true;
    if (mountedRef.current) {
      setCurrentAnnouncement("");
      requestAnimationFrame(() => {
        if (mountedRef.current && announcementsRef.current.length) {
          const { announcement } =
            announcementsRef.current.shift() as AnnouncementItem;
          setCurrentAnnouncement(announcement);
          setTimeout(announceAllLegacy, ARIA_ANNOUNCE_DELAY);
        } else {
          isAnnouncingRef.current = false;
        }
      });
    }
  }, []);

  /**
   *  TODO default to `assertive` until a breaking change, when we should switch to `polite`
   */
  const announce = useCallback(
    (
      announcement: string,
      legacyDelayOrOptions: number | AnnounceFnOptions | undefined = {},
    ) => {
      let options: AnnounceFnOptions = {};
      let isLegacy = false;
      if (typeof legacyDelayOrOptions === "number") {
        isLegacy = true;
      } else {
        options = legacyDelayOrOptions;
      }
      announcementsRef.current.push({ announcement, ...options });
      if (isAnnouncingRef.current) {
        return;
      }
      if (isLegacy) {
        isAnnouncingRef.current = true;
        announceAllLegacy();
      } else {
        announceAll();
      }
    },
    [announceAll, announceAllLegacy],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AriaAnnouncerContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live={
          (ariaLive as React.AriaAttributes["aria-live"]) ?? "assertive"
        }
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
        {...rest}
      >
        {currentAnnouncement}
      </div>
    </AriaAnnouncerContext.Provider>
  );
}
