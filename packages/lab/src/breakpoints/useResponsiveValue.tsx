import { BpType, ResponsiveProp, BreakpointsContextType } from "./types";
import { getResolvedResponsiveValue } from "./utils";

/**
 * useResponsiveValue will return the resolved value of a configuration based on the current viewport
 * E.g. for  `const value = useResponsiveValue({ default: 'red', lg: 'green })`
 * value will be 'red' on small screens but 'green on screens above large'
 */
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
