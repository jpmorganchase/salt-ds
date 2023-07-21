import { createContext, ReactNode, useContext } from "react";

const TrackerStepTooltipContext = createContext<boolean>(false);

type TrackStepTooltipProps = {
  children: ReactNode;
};

export const TrackStepTooltipProvider = ({
  children,
}: TrackStepTooltipProps) => {
  return (
    <TrackerStepTooltipContext.Provider value={true}>
      {children}
    </TrackerStepTooltipContext.Provider>
  );
};

export const useTrackerStepTooltipContext = () =>
  useContext(TrackerStepTooltipContext);
