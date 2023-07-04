import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";

import { TrackerStepProvider } from "./TrackerStep";

import steppedTrackerCss from "./SteppedTracker.css";

const withBaseName = makePrefixer("saltSteppedTracker");

type OnTruncatedCallback = (isTruncated: boolean) => void;

const useDetectTruncatedText = (callback: OnTruncatedCallback) => {
  const [observedMap] = useState(() => new Map<number, HTMLElement>());
  const isTruncatedRef = useRef<boolean>(false);

  // Store callback as a ref to prevent re-creating ResizeObserver
  const callbackRef = useRef<(isOverflowing: boolean) => void>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const getRo = useCallback(() => {
    const observer = new ResizeObserver((entries) => {
      let isTruncated = false;

      for (const entry of entries) {
        const entryElem = entry.target as HTMLElement;

        if (entryElem.offsetWidth < entryElem.scrollWidth) {
          isTruncated = true;
          break;
        }
      }

      if (isTruncated !== isTruncatedRef.current) {
        isTruncatedRef.current = isTruncated;
        callbackRef.current(isTruncated);
      }
    });

    return observer;
  }, []);

  // Manage ResizeObserver lifecycle;
  const [ro, setRo] = useState(() => getRo());

  useEffect(() => {
    return () => {
      ro.disconnect();
    };
  }, [ro]);

  useEffect(() => {
    setRo(getRo());
  }, [getRo]);

  const registerChildRef = useCallback(
    (i: number, el: HTMLElement | null) => {
      if (!el) {
        const existingRef = observedMap.get(i);
        if (existingRef) {
          ro.unobserve(existingRef);
          observedMap.delete(i);
        }
      } else {
        const existingRef = observedMap.get(i);
        if (el === existingRef) {
          return;
        }

        if (existingRef) {
          ro.unobserve(existingRef);
        }
        observedMap.set(i, el);

        ro.observe(el);
      }
    },
    [observedMap, ro]
  );

  const getOverflowRef = useCallback(
    (i: number) => {
      return (el: HTMLElement | null) => {
        registerChildRef(i, el);
      };
    },
    [registerChildRef]
  );

  return getOverflowRef;
};

export interface SteppedTrackerProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * The index of the current activeStep
   */
  activeStep: number;
  /**
   * If `true`, the stepped tracker will be disabled.
   */
  disabled?: boolean;
  /**
   * Should be one or more <TrackerStep> components
   */
  children: ReactNode;
}

export const SteppedTracker = forwardRef<HTMLUListElement, SteppedTrackerProps>(
  function SteppedTracker(
    { children, className, disabled, activeStep, ...restProps },
    ref?
  ): ReactElement<SteppedTrackerProps> {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepped-tracker",
      css: steppedTrackerCss,
      window: targetWindow,
    });

    const [hasTooltips, setHasTooltips] = useState(false);

    const getOverflowRef = useDetectTruncatedText((isTruncated) => {
      setHasTooltips(isTruncated);
    });

    const totalSteps = Children.count(children);

    const Steps = Children.map(children, (child, i) => (
      <TrackerStepProvider
        value={{
          activeStep,
          stepNumber: i,
          totalSteps,
          getOverflowRef,
          hasTooltip: hasTooltips,
        }}
      >
        {child}
      </TrackerStepProvider>
    ));

    return (
      <ul
        {...restProps}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        {...restProps}
        ref={ref}
      >
        {Steps}
      </ul>
    );
  }
);
