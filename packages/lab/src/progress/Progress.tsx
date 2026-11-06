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

interface ProgressBaseProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
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
   * Returns the value that's shown and announced, such as "3 of 5 files". Defaults to a percentage, such as "38%".
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
   * Milliseconds to wait before showing, so tasks that finish quickly show nothing. Defaults to 1000.
   */
  delay?: number;
  /**
   * What screen readers announce when the task completes, that is when `status` is `"success"` or the value reaches
   * `max`. Set to `null` to turn it off.
   */
  completionAnnouncement?: string | null;
}

export interface ProgressLinearProps extends ProgressBaseProps {
  /**
   * The shape of the indicator. Choose it by the space it's in. Defaults to `"linear"`.
   */
  shape?: "linear";
  /**
   * How much is ready ahead of `value`, such as the part of a video that has loaded but hasn't played. It shows only
   * when there's a `value`.
   */
  bufferValue?: number;
  size?: never;
}

export interface ProgressCircularProps extends ProgressBaseProps {
  /**
   * The shape of the indicator. Choose it by the space it's in.
   */
  shape: "circular";
  /**
   * The size of the indicator. Defaults to `"medium"`.
   */
  size?: ProgressSize;
  bufferValue?: never;
}

/**
 * `size` is only for circular progress, and `bufferValue` only for linear progress.
 */
export type ProgressProps = ProgressLinearProps | ProgressCircularProps;

// Indeterminate progress repeats its announcement at the same times as Spinner
const ANNOUNCER_INTERVAL = 5000;
const ANNOUNCER_TIMEOUT = 20000;

function getFraction(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

function defaultGetValueText(value: number, max: number, min: number) {
  return `${Math.round(getFraction(value, min, max) * 100)}%`;
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

      announce(labelText);
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - startTime > ANNOUNCER_TIMEOUT) {
          announce(
            `${labelText} is still in progress, but will no longer announce.`,
          );
          clearInterval(interval);
          return;
        }
        announce(labelText);
      }, ANNOUNCER_INTERVAL);

      return () => clearInterval(interval);
    }, [loops, announce, labelText]);

    // Screen readers read a progress bar's value themselves, so only the outcome is announced, once.
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

    if (!visible) return null;

    const statusText = status ?? (paused ? "paused" : undefined);
    const ariaValueText = [valueText, statusText].filter(Boolean).join(", ");
    const hideValue =
      hideValueProp ?? (shape === "circular" && size === "small");
    // The success icon says the task is complete, so the value would repeat it
    const showValue =
      !hideValue && valueText !== undefined && status !== "success";
    const showPaused = paused && !status;
    const valueInside = shape === "circular" && size === "large";
    const showHeader = Boolean(
      label || status || showPaused || (showValue && !valueInside),
    );

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
          !indeterminate && fraction === 0 && withBaseName("empty"),
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
              <circle className={withBaseName("track")} />
              <circle className={withBaseName("trackInner")} />
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
              styleAs="h2"
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
                {showPaused && (
                  <Text
                    className={withBaseName("value")}
                    color="secondary"
                    aria-hidden="true"
                  >
                    Paused
                  </Text>
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
