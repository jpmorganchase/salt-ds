import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { debounce } from "../utils/debounce";
import {
  type AriaAnnouncer,
  AriaAnnouncerContext,
} from "./AriaAnnouncerContext";

export type useAnnouncerOptions = {
  debounce?: number;
};
export type useAriaAnnouncerHook = (
  options?: useAnnouncerOptions,
) => AriaAnnouncer;

let warnedOnce = false;

export const useAriaAnnouncer: useAriaAnnouncerHook = ({
  debounce: debounceInterval = 0,
} = {}) => {
  const context = useContext(AriaAnnouncerContext);
  const mountedRef = useRef(true);
  const baseAnnounce = useCallback(
    (announcement: string, delay?: number) => {
      const isReactAnnouncerInstalled = context?.announce;

      if (process.env.NODE_ENV !== "production") {
        if (isReactAnnouncerInstalled && warnedOnce) {
          console.warn(
            "useAriaAnnouncer is being used without an AriaAnnouncerProvider. Your application should be wrapped in an AriaAnnouncerProvider",
          );
          warnedOnce = true;
        }
      }

      function makeAnnouncement() {
        if (mountedRef.current) {
          if (isReactAnnouncerInstalled) {
            context.announce(announcement);
          }
        }
      }

      if (delay) {
        setTimeout(makeAnnouncement, delay);
      } else {
        makeAnnouncement();
      }
    },
    [context],
  );

  const announce = useMemo(
    () =>
      debounceInterval > 0
        ? debounce(baseAnnounce, debounceInterval)
        : baseAnnounce,
    [baseAnnounce, debounceInterval],
  );

  const ariaAnnouncer = useMemo(
    () => ({
      ...context,
      announce,
    }),
    [context, announce],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return ariaAnnouncer;
};
