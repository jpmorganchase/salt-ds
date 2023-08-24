import { ReactElement } from "react";
import { capitalize, Card, useTheme } from "@salt-ds/core";

export const Modes = (): ReactElement => {
  const { mode } = useTheme();

  return <Card style={{ minHeight: "unset" }}>{capitalize(mode)} mode</Card>;
};
