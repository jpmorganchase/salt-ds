import {
  type ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForkRef } from "../utils/index";
import {
  type AnnounceFnOptions,
  AriaAnnouncerContext,
} from "./AriaAnnouncerContext";

export const ANNOUNCEMENT_TIME_IN_DOM = 300; // time between DOM updates

export interface AriaAnnouncerProviderProps
  extends ComponentPropsWithRef<"div"> {}

const AnnouncementRegion = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<"div">
>(function AnnouncementRegion(props, ref) {
  return (
    <div
      role="log"
      aria-atomic={true}
      aria-relevant="additions"
      ref={ref}
      {...props}
    />
  );
});

type AnnouncementMessage = {
  id: string;
  message: string;
};

export const AriaAnnouncerProvider = forwardRef<
  HTMLDivElement,
  AriaAnnouncerProviderProps
>(function AriaAnnouncerProvider({ children, style, ...rest }, ref) {
  const [politeAnnouncements, setPoliteAnnouncements] = useState<
    AnnouncementMessage[]
  >([]);
  const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<
    AnnouncementMessage[]
  >([]);

  const mountedRef = useRef(true);

  const makeAnnouncement = useCallback(
    (message: string, assertiveness: "polite" | "assertive" = "polite") => {
      const id = `announce-${assertiveness}-${Date.now()}`;
      if (assertiveness === "polite") {
        setPoliteAnnouncements((previous) => {
          return previous.concat({ id, message });
        });

        setTimeout(() => {
          setPoliteAnnouncements((previous) =>
            previous.filter((announcement) => announcement.id !== id),
          );
        }, ANNOUNCEMENT_TIME_IN_DOM);
      } else {
        setAssertiveAnnouncements((previous) => {
          return previous.concat({ id, message });
        });

        setTimeout(() => {
          setAssertiveAnnouncements((previous) =>
            previous.filter((announcement) => announcement.id !== id),
          );
        }, ANNOUNCEMENT_TIME_IN_DOM);
      }
    },
    [],
  );

  const announce = useCallback(
    (
      announcement: string,
      legacyDelayOrOptions: number | AnnounceFnOptions | undefined = {},
    ) => {
      const delay =
        typeof legacyDelayOrOptions === "number" ? legacyDelayOrOptions : null;

      const assertiveness =
        typeof legacyDelayOrOptions === "object"
          ? legacyDelayOrOptions.ariaLive
          : undefined;

      if (delay) {
        setTimeout(() => {
          makeAnnouncement(announcement, assertiveness);
        }, delay);
      } else {
        makeAnnouncement(announcement, assertiveness);
      }
    },
    [makeAnnouncement],
  );

  const value = useMemo(() => ({ announce }), [announce]);

  const handleMounted = useCallback((node: HTMLDivElement | null) => {
    mountedRef.current = node !== null;
  }, []);

  const handleRef = useForkRef(ref, handleMounted);

  return (
    <AriaAnnouncerContext.Provider value={value}>
      {children}
      <div
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
        ref={handleRef}
      >
        <AnnouncementRegion aria-live="polite">
          {politeAnnouncements.map((announcement) => (
            <div key={`polite-${announcement.id}`}>{announcement.message}</div>
          ))}
        </AnnouncementRegion>
        <AnnouncementRegion aria-live="assertive">
          {assertiveAnnouncements.map((announcement) => (
            <div key={`assertive-${announcement.id}`}>
              {announcement.message}
            </div>
          ))}
        </AnnouncementRegion>
      </div>
    </AriaAnnouncerContext.Provider>
  );
});
