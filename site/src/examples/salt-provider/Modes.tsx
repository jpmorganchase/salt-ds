import { Card, capitalize, useTheme } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Modes = (): ReactElement => {
  const { mode } = useTheme();

  return <Card style={{ minHeight: "unset" }}>{capitalize(mode)} mode</Card>;
};
