import {
  type ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
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
      // Keep the region simple for maximum assistive-tech compatibility.
      // aria-live is applied by the caller (polite/assertive).
      aria-atomic={false}
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

  const idCounterRef = useRef(0);

  const makeAnnouncement = useCallback(
    (
      message: string,
      assertiveness: "polite" | "assertive" = "polite",
      duration: number = ANNOUNCEMENT_TIME_IN_DOM,
    ) => {
      idCounterRef.current += 1;
      // Date.now() can collide when multiple announcements are created in the same millisecond
      // (e.g. tests with cy.clock, batching, or multiple announces during one tick).
      // Add a monotonic counter suffix to guarantee uniqueness.
      const id = `announce-${assertiveness}-${Date.now()}-${idCounterRef.current}`;
      if (assertiveness === "polite") {
        setPoliteAnnouncements((previous) => {
          return previous.concat({ id, message });
        });

        setTimeout(() => {
          setPoliteAnnouncements((previous) =>
            previous.filter((announcement) => announcement.id !== id),
          );
        }, duration);
      } else {
        setAssertiveAnnouncements((previous) => {
          return previous.concat({ id, message });
        });

        setTimeout(() => {
          setAssertiveAnnouncements((previous) =>
            previous.filter((announcement) => announcement.id !== id),
          );
        }, duration);
      }
    },
    [],
  );

  const announce = useCallback(
    (
      announcement: string,
      legacyDelayOrOptions: number | AnnounceFnOptions | undefined = {},
    ) => {
      // Legacy delay (number arg) is handled by useAriaAnnouncer; if we also delayed
      // here we'd apply it twice. Keep supporting the signature but ignore the delay.
      const options: AnnounceFnOptions =
        typeof legacyDelayOrOptions === "object" && legacyDelayOrOptions
          ? legacyDelayOrOptions
          : {};

      makeAnnouncement(
        announcement,
        options.ariaLive,
        options.duration ?? ANNOUNCEMENT_TIME_IN_DOM,
      );
    },
    [makeAnnouncement],
  );

  const value = useMemo(() => ({ announce }), [announce]);

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
        ref={ref}
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
