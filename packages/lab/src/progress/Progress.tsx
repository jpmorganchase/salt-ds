import {
  makePrefixer,
  StatusIndicator,
  Text,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import progressCss from "./Progress.css";

const withBaseName = makePrefixer("saltProgress");

export type ProgressShape = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressStatus = "success" | "error";

export interface ProgressProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * The shape of the indicator. Choose it by the space it's in. Defaults to `"linear"`.
   */
  shape?: ProgressShape;
  /**
   * How much is done, between `min` and `max`. Leave it out for indeterminate progress, which loops until the work
   * finishes.
   */
  value?: number;
  /**
   * The minimum value. Defaults to 0.
   */
  min?: number;
  /**
   * The maximum value. Defaults to 100.
   */
  max?: number;
  /**
   * Linear only. How much is ready ahead of `value`, such as the part of a video that has loaded but hasn't played. It
   * shows only when there's a `value`.
   */
  bufferValue?: number;
  /**
   * What's happening, such as "Uploading report.pdf". It's shown, and used as the accessible name.
   */
  label?: ReactNode;
  /**
   * Helper text, such as "About 2 minutes left".
   */
  description?: ReactNode;
  /**
   * Hides the value text. Screen readers still announce it. Defaults to `true` for small circular progress, which is
   * used in compact spaces such as buttons, and `false` otherwise.
   */
  hideValue?: boolean;
  /**
   * Returns the value that's shown and announced, such as "3 of 5 files". Defaults to a percentage formatted for the
   * user's locale.
   */
  getValueText?: (value: number, max: number, min: number) => string;
  /**
   * The outcome of the task.
   */
  status?: ProgressStatus;
  /**
   * Whether the task is paused.
   */
  paused?: boolean;
  /**
   * Circular only. The size of the indicator. Defaults to `"medium"`.
   */
  size?: ProgressSize;
  /**
   * Milliseconds to wait before showing, so tasks that finish quickly show nothing. Defaults to 1000.
   */
  delay?: number;
  /**
   * Indeterminate only. How often screen readers repeat the loading announcement, in milliseconds. Defaults to 5000.
   */
  announcerInterval?: number;
  /**
   * Indeterminate only. When screen readers stop repeating the loading announcement, in milliseconds. Defaults to
   * 20000.
   */
  announcerTimeout?: number;
  /**
   * What screen readers announce while the task runs. Defaults to the label, when it's a string.
   */
  loadingAnnouncement?: string;
  /**
   * What screen readers announce when the task finishes. Set to `null` to turn it off.
   */
  completionAnnouncement?: string | null;
}

// Determinate progress announces these percentages, rather than every change of value.
const MILESTONES = [75, 50, 25];

function getFraction(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

function defaultGetValueText(value: number, max: number, min: number) {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(getFraction(value, min, max));
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      shape = "linear",
      value: valueProp,
      min = 0,
      max = 100,
      bufferValue,
      label,
      description,
      hideValue: hideValueProp,
      getValueText = defaultGetValueText,
      status,
      paused = false,
      size = "medium",
      delay = 1000,
      announcerInterval = 5000,
      announcerTimeout = 20000,
      loadingAnnouncement: loadingAnnouncementProp,
      completionAnnouncement: completionAnnouncementProp,
      className,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-progress",
      css: progressCss,
      window: targetWindow,
    });

    const id = useId(idProp);
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    const { announce } = useAriaAnnouncer();

    const [visible, setVisible] = useState(delay <= 0);
    useEffect(() => {
      if (delay <= 0) {
        setVisible(true);
        return;
      }
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    // A successful task is complete, so it fills even if its value hasn't caught up.
    const value = status === "success" ? max : valueProp;
    const indeterminate = value === undefined;
    const fraction = indeterminate ? 0 : getFraction(value, min, max);
    const valueText = indeterminate ? undefined : getValueText(value, max, min);
    const bufferFraction =
      shape === "linear" && !indeterminate && bufferValue !== undefined
        ? Math.max(getFraction(bufferValue, min, max), fraction)
        : undefined;

    const labelText =
      typeof label === "string" ? label : (ariaLabel ?? "loading");
    const loadingAnnouncement = loadingAnnouncementProp ?? labelText;
    const completionAnnouncement =
      completionAnnouncementProp === undefined
        ? `finished ${labelText}`
        : completionAnnouncementProp;
    const outcome =
      status === "error"
        ? "error"
        : status === "success" || (!indeterminate && fraction >= 1)
          ? "success"
          : undefined;

    // Indeterminate progress repeats its announcement while it loops, like Spinner.
    const loops = visible && indeterminate && !outcome && !paused;
    useEffect(() => {
      if (!loops) return;

      announce(loadingAnnouncement);
      const startTime = Date.now();
      const interval =
        announcerInterval > 0 &&
        setInterval(() => {
          if (Date.now() - startTime > announcerTimeout) {
            announce(
              `${loadingAnnouncement} is still in progress, but will no longer announce.`,
            );
            interval && clearInterval(interval);
            return;
          }
          announce(loadingAnnouncement);
        }, announcerInterval);

      return () => {
        interval && clearInterval(interval);
      };
    }, [
      loops,
      announce,
      loadingAnnouncement,
      announcerInterval,
      announcerTimeout,
    ]);

    const lastMilestone = useRef(0);
    useEffect(() => {
      if (!visible || indeterminate || outcome) return;
      const milestone = MILESTONES.find((step) => fraction * 100 >= step);
      if (milestone && milestone > lastMilestone.current) {
        lastMilestone.current = milestone;
        announce(`${labelText}, ${valueText}`);
      }
    }, [
      visible,
      indeterminate,
      outcome,
      fraction,
      announce,
      labelText,
      valueText,
    ]);

    // Announce the outcome once, when the task completes or fails.
    const announcedOutcome = useRef<string | undefined>(undefined);
    useEffect(() => {
      if (!visible || !outcome || announcedOutcome.current === outcome) return;
      announcedOutcome.current = outcome;
      if (outcome === "error") {
        announce(`${labelText}, error`);
      } else if (completionAnnouncement) {
        announce(completionAnnouncement);
      }
    }, [visible, outcome, announce, labelText, completionAnnouncement]);

    // Indeterminate progress announces completion when it's removed, like Spinner.
    const latest = useRef({
      visible,
      indeterminate,
      outcome,
      completionAnnouncement,
    });
    latest.current = {
      visible,
      indeterminate,
      outcome,
      completionAnnouncement,
    };
    useEffect(
      () => () => {
        const current = latest.current;
        if (
          current.visible &&
          current.indeterminate &&
          !current.outcome &&
          current.completionAnnouncement
        ) {
          announce(current.completionAnnouncement);
        }
      },
      [announce],
    );

    if (!visible) return null;

    const statusText = status ?? (paused ? "paused" : undefined);
    const ariaValueText = [valueText, statusText].filter(Boolean).join(", ");
    const hideValue =
      hideValueProp ?? (shape === "circular" && size === "small");
    const showValue = !hideValue && valueText !== undefined;
    const valueInside = shape === "circular" && size === "large";
    const showHeader = Boolean(label || status || (showValue && !valueInside));

    const indicatorClassName = clsx(
      withBaseName("indicator"),
      indeterminate && withBaseName("indeterminate"),
    );
    const fractionStyle = {
      "--saltProgress-fraction": fraction,
    } as CSSProperties;

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(shape),
          shape === "circular" && withBaseName(size),
          status && withBaseName(status),
          paused && withBaseName("paused"),
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div
          className={withBaseName("progressbar")}
          id={id}
          role="progressbar"
          aria-label={label ? undefined : ariaLabel}
          aria-labelledby={label ? labelId : ariaLabelledBy}
          aria-describedby={
            clsx(description && descriptionId, ariaDescribedBy) || undefined
          }
          aria-valuemin={indeterminate ? undefined : min}
          aria-valuemax={indeterminate ? undefined : max}
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuetext={ariaValueText || undefined}
        >
          {shape === "circular" ? (
            <svg className={indicatorClassName} aria-hidden="true">
              <circle className={withBaseName("track")} pathLength={100} />
              <circle
                className={withBaseName("bar")}
                pathLength={100}
                style={fractionStyle}
              />
            </svg>
          ) : (
            <div className={indicatorClassName} aria-hidden="true">
              <div className={withBaseName("track")} />
              {bufferFraction !== undefined && (
                <div
                  className={withBaseName("buffer")}
                  style={
                    {
                      "--saltProgress-bufferFraction": bufferFraction,
                    } as CSSProperties
                  }
                />
              )}
              <div className={withBaseName("bar")} style={fractionStyle} />
            </div>
          )}
          {valueInside && showValue && (
            <Text
              className={withBaseName("valueInside")}
              styleAs="label"
              aria-hidden="true"
            >
              {valueText}
            </Text>
          )}
        </div>
        {(showHeader || description) && (
          <div className={withBaseName("text")}>
            {showHeader && (
              <div className={withBaseName("header")}>
                {label && (
                  <Text id={labelId} className={withBaseName("label")}>
                    {label}
                  </Text>
                )}
                {status && (
                  <StatusIndicator
                    status={status}
                    className={withBaseName("statusIcon")}
                  />
                )}
                {showValue && !valueInside && (
                  <Text
                    className={withBaseName("value")}
                    color="secondary"
                    aria-hidden="true"
                  >
                    {valueText}
                  </Text>
                )}
              </div>
            )}
            {description && (
              <Text
                id={descriptionId}
                className={withBaseName("description")}
                styleAs="label"
                color="secondary"
              >
                {description}
              </Text>
            )}
          </div>
        )}
      </div>
    );
  },
);
