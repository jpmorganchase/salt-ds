import { useViewport } from "@salt-ds/core";

const useIsMobileView = (): boolean => {
  const viewport = useViewport();

  const isMobileView = viewport <= 996;
  return isMobileView;
};

export default useIsMobileView;
