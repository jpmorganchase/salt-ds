import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import warning from "warning";
import { debounce } from "../utils/debounce";
import { AriaAnnouncer, AriaAnnouncerContext } from "./AriaAnnouncerContext";

export type useAnnouncerOptions = {
  debounce?: number;
};
export type useAriaAnnouncerHook = (
  options?: useAnnouncerOptions
) => AriaAnnouncer;

export const useAriaAnnouncer: useAriaAnnouncerHook = ({
  debounce: debounceInterval = 0,
} = {}) => {
  const context = useContext(AriaAnnouncerContext);
  const mountedRef = useRef(true);
  const baseAnnounce = useCallback(
    (announcement, delay) => {
      const isReactAnnouncerInstalled = context && context.announce;

      warning(
        isReactAnnouncerInstalled,
        "useAriaAnnouncer is being used without an AriaAnnouncerProvider. Your application should be wrapped in an AriaAnnouncerProvider"
      );

      function makeAnnouncement() {
        if (mountedRef.current) {
          if (isReactAnnouncerInstalled) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context!.announce(announcement);
          }
        }
      }

      if (delay) {
        setTimeout(makeAnnouncement, delay);
      } else {
        makeAnnouncement();
      }
    },
    [context]
  );

  const announce = useMemo(
    () =>
      debounceInterval > 0
        ? debounce(baseAnnounce, debounceInterval)
        : baseAnnounce,
    [baseAnnounce, debounceInterval]
  );

  const ariaAnnouncer = useMemo(
    () => ({
      ...context,
      announce,
    }),
    [context, announce]
  );

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  return ariaAnnouncer;
};
