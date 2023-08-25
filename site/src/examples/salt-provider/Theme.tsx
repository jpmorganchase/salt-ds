import { ReactElement } from "react";
import { SaltProvider, useTheme } from "@salt-ds/core";

export const Theme = (): ReactElement => {
  const { theme } = useTheme();

  return <SaltProvider theme="salt-theme">Current theme: {theme}</SaltProvider>;
};
