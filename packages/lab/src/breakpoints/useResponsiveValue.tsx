import { BpType, ResponsiveProp, BreakpointsContextType } from "./types";
import { getResolvedResponsiveValue } from "./utils";

export const createUseResponsiveValue = <BP extends BpType>(
  useBreakpointsContext: () => BreakpointsContextType<BP>
) => {
  const useResponsiveValue = <V extends unknown, InnerBP extends BP>(
    responsiveValue: ResponsiveProp<V, InnerBP> | V
  ) => {
    const context = useBreakpointsContext();
    const resolvedValue = getResolvedResponsiveValue(responsiveValue, context);

    return resolvedValue;
  };

  return useResponsiveValue;
};

export type UseResponsiveValue = ReturnType<typeof createUseResponsiveValue>;
