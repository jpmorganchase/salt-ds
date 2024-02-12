import { createContext, useContext, ReactNode, useMemo } from "react";

export interface SteppedTrackerContextType {
  activeStep: number;
  totalSteps: number;
  isWithinSteppedTracker: boolean;
}

const defaultSteppedTrackerContext = {
  activeStep: 0,
  totalSteps: 1,
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
  totalSteps,
  children,
}: SteppedTrackerProviderProps) => {
  const steppedTrackerContextValue: SteppedTrackerContextType = useMemo(
    () => ({
      activeStep,
      totalSteps,
      isWithinSteppedTracker: true,
    }),
    [activeStep, totalSteps]
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

interface TrackerStepProviderProps {
  stepNumber: number;
  children: ReactNode;
}

export const TrackerStepProvider = ({
  children,
  stepNumber,
}: TrackerStepProviderProps) => {
  return (
    <TrackerStepContext.Provider value={stepNumber}>
      {children}
    </TrackerStepContext.Provider>
  );
};
