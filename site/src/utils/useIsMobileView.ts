import { useViewport } from "@jpmorganchase/uitk-core";

const useIsMobileView = (): boolean => {
  const viewport = useViewport();

  const isMobileView = viewport <= 996;
  return isMobileView;
};

export default useIsMobileView;
