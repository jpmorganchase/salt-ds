import { useBreakpoint } from "@salt-ds/core";

export function useIsMobileView() {
  const { matchedBreakpoints } = useBreakpoint();
  return !matchedBreakpoints.includes("md");
}
