import { MouseEvent } from "react";
import { createContext, useContext } from "react";

export interface BannerContextValue {
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const BannerContext = createContext<BannerContextValue>({});

export const useBannerContext = () => {
  return useContext(BannerContext);
};
