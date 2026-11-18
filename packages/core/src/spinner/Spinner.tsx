import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect } from "react";
import { useAriaAnnouncer } from "../aria-announcer";
import { makePrefixer, useId } from "../utils";
import spinnerCss from "./Spinner.css";
import { SpinnerSVG } from "./svgSpinners/SpinnerSVG";

/**
 * Spinner component, provides an indeterminate loading indicator
 *
 * @example
 * <Spinner size="small" | "medium" | "large" />
 */

export const SpinnerSizeValues = [
  "default",
  "large",
  "small",
  "medium",
] as const;

type SpinnerSize = (typeof SpinnerSizeValues)[number];

export type SpinnerSVGSize = Exclude<SpinnerSize, "default">;

const handleSize = (size: SpinnerSize): SpinnerSVGSize =>
  size === "default" ? "medium" : size;

const withBaseName = makePrefixer("saltSpinner");

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The interval in milliseconds at which the component continues to announce the `aria-label`.
   * @default 5000
   */
  announcerInterval?: number;
  /**
   * The time in milliseconds after which the component stops announcing the `aria-label`.
   * @default 20000
   */
  announcerTimeout?: number;
  /**
   * Determines the message to be announced by the component when it unmounts. Set to null if not needed.
   */
  completionAnnouncement?: string | null;
  /**
   * If `true`, the built-in ARIA announcer is inactive.
   */
  disableAnnouncer?: boolean;
  /**
   * The role of the spinner's root element.
   * @default "img"
   */
  role?: string;
  /**
   * Determines the size of the spinner. Must be one of: 'default', 'large', 'small', 'medium'.
   */
  size?: SpinnerSize;
  /**
   * The ID of the spinner's SVG element. It's also used as a prefix for the IDs
   * inside the SVG, and isn't applied to the root element. When not set, an ID
   * is generated.
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
      className,
      size: sizeProp = "medium",
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const id = useId(idProp);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-spinner",
      css: spinnerCss,
      window: targetWindow,
    });

    const { announce } = useAriaAnnouncer();

    const size = handleSize(sizeProp);

    useEffect(() => {
      if (disableAnnouncer) return;

      announce(ariaLabel);

      const startTime = Date.now();

      const interval =
        announcerInterval > 0 &&
        setInterval(() => {
          if (Date.now() - startTime > announcerTimeout) {
            // The announcer will stop after `announcerTimeout` time
            announce(
              `${ariaLabel} is still in progress, but will no longer announce.`,
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
        role="img"
        {...rest}
      >
        <SpinnerSVG id={id} />
      </div>
    );
  },
);
