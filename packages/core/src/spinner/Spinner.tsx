import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { useAriaAnnouncer } from "../aria-announcer";
import { makePrefixer, useId } from "../utils";
import { SpinnerSVG } from "./svgSpinners/SpinnerSVG";

import spinnerCss from "./Spinner.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useDensity } from "@salt-ds/core";

/**
 * Spinner component, provides an indeterminate loading indicator
 *
 * @example
 * <Spinner size="default | "large" | "small" />
 */

export const SpinnerSizeValues = ["default", "large", "small"] as const;
export type SpinnerSize = (typeof SpinnerSizeValues)[number];
const withBaseName = makePrefixer("saltSpinner");

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Determines the interval on which the component will continue to announce the aria-label. Defaults to 5000ms (5s)
   */
  announcerInterval?: number;
  /**
   *  * Determines the interval after which the component will stop announcing the aria-label. Defaults to 20000ms (20s)
   */
  announcerTimeout?: number;
  /**
   * The className(s) of the component
   */
  className?: string;
  /**
   * Determines the message to be announced by the component when it unmounts. Set to null if not needed.
   */
  completionAnnouncement?: string | null;
  /**
   * If true, built in aria announcer will be inactive
   */
  disableAnnouncer?: boolean;
  /**
   * The prop for the role attribute of the component
   */
  role?: string;
  /**
   * Determines the size of the spinner. Must be one of: 'default', 'large', 'small'.
   */
  size?: SpinnerSize;
  /**
   * The ids of the SvgSpinner components
   */
  id?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  function Spinner(
    {
      "aria-label": ariaLabel = "loading",
      announcerInterval = 5000,
      announcerTimeout = 20000,
      completionAnnouncement = `finished ${ariaLabel}`,
      disableAnnouncer,
      role = "img",
      className,
      size = "default",
      id: idProp,
      ...rest
    },
    ref
  ) {
    const id = useId(idProp);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-spinner",
      css: spinnerCss,
      window: targetWindow,
    });

    const { announce } = useAriaAnnouncer();

    const density = useDensity();

    useEffect(() => {
      if (disableAnnouncer) return;

      announce(ariaLabel);

      const startTime = new Date().getTime();

      const interval =
        announcerInterval > 0 &&
        setInterval(() => {
          if (new Date().getTime() - startTime > announcerTimeout) {
            // The announcer will stop after `announcerTimeout` time
            announce(
              `${ariaLabel} is still in progress, but will no longer announce.`
            );
            interval && clearInterval(interval);
            return;
          }
          announce(ariaLabel);
        }, announcerInterval);

      return () => {
        if (disableAnnouncer) return;

        interval && clearInterval(interval);
        if (completionAnnouncement) {
          announce(completionAnnouncement);
        }
      };
    }, [
      announce,
      announcerInterval,
      announcerTimeout,
      ariaLabel,
      completionAnnouncement,
      disableAnnouncer,
    ]);

    return (
      <div
        aria-label={ariaLabel}
        className={clsx(withBaseName(), withBaseName(size), className)}
        ref={ref}
        role={role}
        {...rest}
      >
        <SpinnerSVG size={size} density={density} id={id} />
      </div>
    );
  }
);
