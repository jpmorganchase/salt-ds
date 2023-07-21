import { createContext, useContext, ReactNode, useMemo } from "react";

import { GetOverflowRef } from "./useDetectTruncatedText";

export type SteppedTrackerContextType = {
  activeStep: number;
  getOverflowRef: GetOverflowRef;
  hasTooltips: boolean;
  totalSteps: number;
  isWithinSteppedTracker: boolean;
};

const defaultSteppedTrackerContext = {
  activeStep: 0,
  hasTooltips: false,
  totalSteps: 1,
  getOverflowRef: () => undefined,
  isWithinSteppedTracker: false,
};

const SteppedTrackerContext = createContext(
  defaultSteppedTrackerContext as unknown as SteppedTrackerContextType
);

type SteppedTrackerProviderProps = Omit<
  SteppedTrackerContextType,
  "isWithinSteppedTracker"
> & {
  children: ReactNode;
};

export const SteppedTrackerProvider = ({
  activeStep,
  getOverflowRef,
  hasTooltips,
  totalSteps,
  children,
}: SteppedTrackerProviderProps) => {
  const steppedTrackerContextValue: SteppedTrackerContextType = useMemo(
    () => ({
      activeStep,
      getOverflowRef,
      hasTooltips,
      totalSteps,
      isWithinSteppedTracker: true,
    }),
    [activeStep, getOverflowRef, hasTooltips, totalSteps]
  );

  return (
    <SteppedTrackerContext.Provider value={steppedTrackerContextValue}>
      {children}
    </SteppedTrackerContext.Provider>
  );
};

export const useSteppedTrackerContext = () => useContext(SteppedTrackerContext);

type TrackerStepNumberContextType = number;

const TrackerStepContext = createContext<TrackerStepNumberContextType>(0);

export const useTrackerStepContext = () => useContext(TrackerStepContext);

type TrackerStepProivderProps = {
  stepNumber: number;
  children: ReactNode;
};

export const TrackerStepProvider = ({
  children,
  stepNumber,
}: TrackerStepProivderProps) => {
  return (
    <TrackerStepContext.Provider value={stepNumber}>
      {children}
    </TrackerStepContext.Provider>
  );
};
