import {
  type ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";
import {
  type AnnounceFnOptions,
  AriaAnnouncerContext,
} from "./AriaAnnouncerContext";
import { registerAnnouncementTarget } from "./announcementRegistry";

export const ANNOUNCEMENT_TIME_IN_DOM = 300; // time between DOM updates

export interface AriaAnnouncerProviderProps
  extends ComponentPropsWithRef<"div"> {
  /**
   * Optional target key used to route announcements to this provider.
   */
  target?: string;
}

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
>(function AriaAnnouncerProvider({ children, style, target, ...rest }, ref) {
  const [politeAnnouncements, setPoliteAnnouncements] = useState<
    AnnouncementMessage[]
  >([]);
  const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<
    AnnouncementMessage[]
  >([]);

  const idCounterRef = useRef(0);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const scheduleRemoval = useCallback(
    (
      id: string,
      assertiveness: "polite" | "assertive",
      duration: number,
    ) => {
      const setter =
        assertiveness === "polite"
          ? setPoliteAnnouncements
          : setAssertiveAnnouncements;
      const handle: ReturnType<typeof setTimeout> = setTimeout(() => {
        timeoutsRef.current.delete(handle);
        setter((previous) =>
          previous.filter((announcement) => announcement.id !== id),
        );
      }, duration);
      timeoutsRef.current.add(handle);
    },
    [],
  );

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
      } else {
        setAssertiveAnnouncements((previous) => {
          return previous.concat({ id, message });
        });
      }
      scheduleRemoval(id, assertiveness, duration);
    },
    [scheduleRemoval],
  );

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const handle of timeouts) {
        clearTimeout(handle);
      }
      timeouts.clear();
    };
  }, []);

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

  useIsomorphicLayoutEffect(() => {
    if (!target) {
      return;
    }
    return registerAnnouncementTarget(target, announce);
  }, [announce, target]);

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
