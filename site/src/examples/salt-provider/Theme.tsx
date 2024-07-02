import { SaltProvider, useTheme } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Theme = (): ReactElement => {
  const { theme } = useTheme();

  return <SaltProvider theme="salt-theme">Current theme: {theme}</SaltProvider>;
};
