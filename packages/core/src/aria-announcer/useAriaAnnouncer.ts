import { useCallback, useContext, useMemo } from "react";
import { debounce } from "../utils";
import {
  type AnnounceFnOptions,
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
let warnedLegacyOnce = false;

export const useAriaAnnouncer: useAriaAnnouncerHook = ({
  debounce: debounceInterval = 0,
} = {}) => {
  const context = useContext(AriaAnnouncerContext);
  const baseAnnounce = useCallback(
    (announcement: string, delayOrOptions: number | AnnounceFnOptions = {}) => {
      const isLegacy = typeof delayOrOptions === "number";
      let legacyDelay: number | undefined;
      let options: AnnounceFnOptions = {};
      /** TODO remove legacy `delay` arg (number) in favour of `options` (AnnounceFnOptions) as a breaking change */
      if (isLegacy) {
        legacyDelay = delayOrOptions as number;
      } else {
        options = delayOrOptions;
      }
      const isReactAnnouncerInstalled = context?.announce;

      if (process.env.NODE_ENV !== "production") {
        if (legacyDelay !== undefined && !warnedLegacyOnce) {
          console.warn(
            "useAriaAnnouncer `delay` prop is deprecated, use `duration` through `AnnounceFnOptions` instead.",
          );
          warnedLegacyOnce = true;
        }
        if (!isReactAnnouncerInstalled && !warnedOnce) {
          console.warn(
            "useAriaAnnouncer is being used without an AriaAnnouncerProvider. Your application should be wrapped in an AriaAnnouncerProvider",
          );
          warnedOnce = true;
        }
      }

      function makeAnnouncement() {
        // Allow announcements from component cleanup.
        // React runs effect cleanups in parent->child ordering, so gating announcements on a
        // hook-level mounted flag can incorrectly block announcements that occur during unmount
        // (e.g. Spinner completionAnnouncement).
        if (isReactAnnouncerInstalled) {
          context.announce(announcement, isLegacy ? legacyDelay : options);
        }
      }

      if (legacyDelay) {
        setTimeout(makeAnnouncement, legacyDelay);
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

  return useMemo(
    () => ({
      ...context,
      announce,
    }),
    [context, announce],
  );
};
