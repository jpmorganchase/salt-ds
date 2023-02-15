import { ResponsiveProp, BreakpointsContextType, BpType } from "./types";

export const isResponsiveValue = <V extends unknown, BP extends BpType>(
  value: V | ResponsiveProp<V, BP>
): value is ResponsiveProp<V, BP> => {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "default" in (value as Record<string, unknown>)
  ) {
    return true;
  }
  return false;
};

export const getResolvedResponsiveValue = <
  V extends unknown,
  BP extends BpType
>(
  responsiveValue: ResponsiveProp<V, BP> | V,
  {
    breakpointOrder,
    currentBreakpoint,
    orderedBreakpoints,
  }: BreakpointsContextType<BP>
) => {
  if (!isResponsiveValue(responsiveValue)) {
    return responsiveValue;
  }

  const { default: defaultValue, ...restValues } = responsiveValue;

  let resolvedValue: V = defaultValue;

  const currentOrder = breakpointOrder[currentBreakpoint];
  let i: number = currentOrder;
  while (i >= 0) {
    const bp = orderedBreakpoints[i];
    if (bp in restValues) {
      resolvedValue = restValues[bp as keyof typeof restValues] as V;
      break;
    } else {
      i = i - 1;
    }
  }

  return resolvedValue;
};
