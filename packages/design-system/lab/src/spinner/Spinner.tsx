import { useAriaAnnouncer, useId } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { getSvgSpinner } from "./svgSpinners";

import "./Spinner.css";

/**
 * Spinner component, provides an indeterminate loading indicator
 *
 * @example
 * <Spinner size="small | medium | large" />
 */

// TODO: documentation -- add line about best practices:
// - Improve accessibility by customizing the aria-label to provide additional context about *what* is loading, e.g. `aria-label="loading settings panel"`.

export const SpinnerSizeValues = ["small", "medium", "large"] as const;
export type SpinnerSize = typeof SpinnerSizeValues[number];
const baseName = "uitkSvgSpinner";

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
   * Determines the size of the spinner. Must be one of: 'small', 'medium', 'large'.
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
      size = "medium",
      id: idProps,
      ...rest
    },
    ref
  ) {
    const generatedId = useId(idProps);
    const SvgSpinner = getSvgSpinner(size);

    const { announce } = useAriaAnnouncer();

    useEffect(() => {
      if (disableAnnouncer) return;

      announce(ariaLabel);

      const startTime = new Date().getTime();

      const interval =
        // announcerInterval > 0 &&
        // above line was causing typescript type error that I didn't manage to sort out right away
        setInterval(() => {
          if (new Date().getTime() - startTime > announcerTimeout) {
            // the announcer will stop after 20s
            announce(
              `${ariaLabel} is still in progress, but will no longer announce.`
            );
            clearInterval(interval);
            return;
          }
          announce(ariaLabel);
        }, announcerInterval);

      return () => {
        if (disableAnnouncer) return;

        clearInterval(interval);
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
        className={cx(`${baseName}-${size}`, className, baseName)}
        ref={ref}
        role={role}
        {...rest}
      >
        <SvgSpinner id={generatedId} />
      </div>
    );
  }
);
