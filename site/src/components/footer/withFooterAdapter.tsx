import React, { FC } from "react";
import { useFooter } from "@jpmorganchase/mosaic-store";
import { FooterProps } from "./Footer";

export const withFooterAdapter = (Component: FC<FooterProps>) => () => {
  const props = useFooter();

  return <Component {...props} />;
};
