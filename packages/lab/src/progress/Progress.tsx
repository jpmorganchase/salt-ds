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
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import progressCss from "./Progress.css";

const withBaseName = makePrefixer("saltProgress");

export type ProgressShape = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressStatus = "active" | "paused" | "success" | "error";

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
   * Returns the value that's shown and announced, such as "3 of 5 files". Defaults to a percentage, such as "38%". The
   * value is always shown, except on small circular progress, which fits in compact spaces such as buttons. Screen
   * readers read it from the progress bar either way.
   */
  getValueText?: (value: number, max: number, min: number) => string;
  /**
   * The state of the task. Defaults to `"active"`. Set to `"success"` when the task has finished successfully.
   * Reaching `max` fills the indicator but doesn't change the task's state.
   */
  status?: ProgressStatus;
  /**
   * Milliseconds to wait before showing, so tasks that finish quickly show nothing. Defaults to 0 (show immediately).
   * Errors and tasks that are already complete when mounted show immediately.
   */
  delay?: number;
  /**
   * What screen readers announce when a visible task's `status` becomes `"success"`. Tasks that finish before the
   * indicator appears are not announced. Set to `null` to turn off the success announcement.
   */
  completionAnnouncement?: string | null;
  /**
   * Disables automatic loading, success and error announcements. The progress bar's accessible name and value remain
   * available. Use when a parent owns the task's announcements. Defaults to `false`.
   */
  disableAnnouncer?: boolean;
}

export interface ProgressLinearProps extends ProgressBaseProps {
  /**
   * The shape of the indicator. Choose it by the space it's in. Defaults to `"linear"`.
   */
  shape?: "linear";
  size?: never;
}

export interface ProgressCircularProps extends ProgressBaseProps {
  // Documented on ProgressLinearProps, so the props table shows one description
  shape: "circular";
  /**
   * Circular only. The size of the indicator. Defaults to `"medium"`.
   */
  size?: ProgressSize;
}

/**
 * `size` is only for circular progress.
 */
export type ProgressProps = ProgressLinearProps | ProgressCircularProps;

// Indeterminate progress repeats its announcement at the same times as Spinner
const ANNOUNCER_INTERVAL = 5000;
const ANNOUNCER_TIMEOUT = 20000;

// The point in each loop where the indicator can stop without jumping: the linear segment has left the track, and the
// circular arc is back at the top. These match the keyframes in Progress.css.
const LOOP_EXIT: Record<ProgressShape, number> = { linear: 0.6, circular: 1 };

/**
 * When the value becomes known, the loop finishes its pass before the indicator fills. Waiting is
 * cancelled if the value is lost again, and a paused, failed or reduced motion loop stops straight away.
 */
function useLoopExit(
  indeterminate: boolean,
  shape: ProgressShape,
  skipExit: boolean,
  progressbarRef: RefObject<HTMLElement | null>,
  targetWindow: Window | null | undefined,
) {
  const [looping, setLooping] = useState(indeterminate);
  if (indeterminate && !looping) {
    setLooping(true);
  }

  useEffect(() => {
    if (indeterminate || !looping) return;

    const loop = progressbarRef.current
      ?.getAnimations?.({ subtree: true })
      .find((animation) =>
        (animation as CSSAnimation).animationName?.startsWith("saltProgress-"),
      );
    const reducedMotion = targetWindow?.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    const timing =
      !skipExit && loop?.playState === "running" && !reducedMotion?.matches
        ? loop.effect?.getComputedTiming()
        : undefined;
    const remaining =
      Math.max(LOOP_EXIT[shape] - (timing?.progress ?? 1), 0) *
      (Number(timing?.duration) || 0);

    if (remaining <= 0) {
      setLooping(false);
      return;
    }
    const timer = setTimeout(() => setLooping(false), remaining);
    const handleReducedMotion = (event: MediaQueryListEvent) => {
      if (event.matches) {
        clearTimeout(timer);
        setLooping(false);
      }
    };
    reducedMotion?.addEventListener("change", handleReducedMotion);
    return () => {
      clearTimeout(timer);
      reducedMotion?.removeEventListener("change", handleReducedMotion);
    };
  }, [indeterminate, looping, shape, skipExit, progressbarRef, targetWindow]);

  return looping;
}

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
      label,
      description,
      getValueText = defaultGetValueText,
      status = "active",
      size = "medium",
      delay = 0,
      completionAnnouncement: completionAnnouncementProp,
      disableAnnouncer = false,
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

    const paused = status === "paused";
    const outcome =
      status === "success" || status === "error" ? status : undefined;

    // A successful task is complete, so it fills even if its value hasn't caught up.
    const value = status === "success" ? max : valueProp;
    const indeterminate = value === undefined;
    const fraction = indeterminate ? 0 : getFraction(value, min, max);
    const valueText = indeterminate ? undefined : getValueText(value, max, min);

    // The indicator keeps looping until the loop's pass ends, but the value is announced straight away
    const progressbarRef = useRef<HTMLDivElement>(null);
    const looping = useLoopExit(
      indeterminate,
      shape,
      paused || status === "error",
      progressbarRef,
      targetWindow,
    );
    const shownFraction = looping ? 0 : fraction;

    const labelText =
      typeof label === "string" ? label : (ariaLabel ?? "loading");
    const completionAnnouncement =
      completionAnnouncementProp === undefined
        ? `finished ${labelText}`
        : completionAnnouncementProp;
    const [visible, setVisible] = useState(delay <= 0 || outcome !== undefined);
    useEffect(() => {
      if (visible) return;
      if (delay <= 0 || outcome === "error") {
        setVisible(true);
        return;
      }
      // A task that finishes before it appears must not reveal a stale indicator.
      if (outcome === "success") return;

      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay, outcome, visible]);

    // Indeterminate progress repeats its announcement while it loops, like Spinner.
    const loops = visible && indeterminate && status === "active";
    useEffect(() => {
      if (!loops || disableAnnouncer) return;

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
    }, [loops, disableAnnouncer, announce, labelText]);

    // Screen readers read a progress bar's value themselves, so only the outcome is announced, once.
    const handledOutcome = useRef<string | undefined>(undefined);
    useEffect(() => {
      if (!outcome) {
        handledOutcome.current = undefined;
        return;
      }
      if (disableAnnouncer) {
        // Turning announcements back on must not replay an outcome handled by the parent.
        handledOutcome.current = outcome;
        return;
      }
      if (!visible || handledOutcome.current === outcome) return;
      handledOutcome.current = outcome;
      if (outcome === "error") {
        announce(`${labelText}, error`);
      } else if (completionAnnouncement) {
        announce(completionAnnouncement);
      }
    }, [
      visible,
      outcome,
      disableAnnouncer,
      announce,
      labelText,
      completionAnnouncement,
    ]);

    if (!visible) return null;

    const statusText = status === "active" ? undefined : status;
    const ariaValueText = [valueText, statusText].filter(Boolean).join(", ");
    // Small circular progress fits in compact spaces, so it never shows its value. The success icon says the task is
    // complete, so the value would repeat it.
    const showValue =
      !(shape === "circular" && size === "small") &&
      valueText !== undefined &&
      status !== "success";
    const valueInside = shape === "circular" && size === "large";
    const showHeader = Boolean(
      label || outcome || paused || (showValue && !valueInside),
    );

    const indicatorClassName = clsx(
      withBaseName("indicator"),
      looping && withBaseName("indeterminate"),
    );
    // Set on the indicator, so the fraction animates there and the bar follows it
    const indicatorStyle = {
      "--saltProgress-fraction": shownFraction,
    } as CSSProperties;
    // The bar turns the success color once it has filled, so it doesn't change color while it loops
    const barStatus = outcome === "success" && looping ? undefined : outcome;

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(shape),
          shape === "circular" && withBaseName(size),
          barStatus && withBaseName(barStatus),
          paused && withBaseName("paused"),
          !looping && fraction === 0 && withBaseName("empty"),
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div
          className={withBaseName("progressbar")}
          ref={progressbarRef}
          id={id}
          role="progressbar"
          aria-label={label ? undefined : ariaLabel}
          aria-labelledby={label ? labelId : ariaLabelledBy}
          aria-describedby={
            clsx(description ? descriptionId : undefined, ariaDescribedBy) ||
            undefined
          }
          aria-valuemin={indeterminate ? undefined : min}
          aria-valuemax={indeterminate ? undefined : max}
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuetext={ariaValueText || undefined}
        >
          {shape === "circular" ? (
            <svg
              className={indicatorClassName}
              style={indicatorStyle}
              aria-hidden="true"
            >
              <circle className={withBaseName("track")} />
              <circle className={withBaseName("bar")} pathLength={100} />
            </svg>
          ) : (
            <div
              className={indicatorClassName}
              style={indicatorStyle}
              aria-hidden="true"
            >
              <div className={withBaseName("track")} />
              <div className={withBaseName("bar")} />
              {looping && <div className={withBaseName("loop")} />}
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
                {outcome && (
                  <StatusIndicator
                    status={outcome}
                    className={withBaseName("statusIcon")}
                  />
                )}
                {paused && (
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
