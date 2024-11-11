import { useFooter } from "@jpmorganchase/mosaic-store";
import type { FC } from "react";
import type { FooterProps } from "./Footer";

export const withFooterAdapter = (Component: FC<FooterProps>) => () => {
  const props = useFooter();

  return <Component {...props} />;
};
