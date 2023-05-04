import { createContext, useContext } from "react";

export interface BannerContextValue {
  onClose?: () => void;
}

export const BannerContext = createContext<BannerContextValue>({});

export const useBannerContext = () => {
  return useContext(BannerContext);
};
