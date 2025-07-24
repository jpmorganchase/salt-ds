import { Card, capitalize, SaltProvider, useTheme } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Modes = (): ReactElement => {
  const { mode } = useTheme();

  return (
    <SaltProvider mode={mode}>
      <Card style={{ minHeight: "unset" }}>{capitalize(mode)} mode</Card>
    </SaltProvider>
  );
};
