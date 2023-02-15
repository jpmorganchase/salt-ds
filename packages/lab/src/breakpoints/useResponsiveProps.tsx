import { ResponsiveProps, BpType, BreakpointsContextType } from "./types";
import { getResolvedResponsiveValue } from "./utils";

/**
 * useResponsiveProps will convert each key in an object into a responsive prop
 * It is used within makeResponsive to make all props of a component responsive
 */
export const createUseResponsiveProps = <BP extends BpType>(
  useBreakpointsContext: () => BreakpointsContextType<BP>
) => {
  const useResponsiveProps = <
    Props extends Record<string, unknown>,
    InnerBP extends BpType = BP
  >(
    responsiveProps: ResponsiveProps<Props, InnerBP>
  ): Props => {
    const context = useBreakpointsContext();

    const resolvedProps = Object.fromEntries(
      Object.entries(responsiveProps).map(
        ([prop, value]) =>
          [prop, getResolvedResponsiveValue(value, context)] as const
      )
    );

    return resolvedProps as Props;
  };

  return useResponsiveProps;
};

export type UseResponsiveProps = ReturnType<typeof createUseResponsiveProps>;
