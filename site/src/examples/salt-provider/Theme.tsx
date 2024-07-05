import { ReactElement } from "react";
import { Card, SaltProvider, StackLayout, useTheme } from "@salt-ds/core";

const ThemeCard = (): ReactElement => {
  const { theme } = useTheme();

  return (
    <Card style={{ minHeight: "unset" }}>
      <StackLayout>Current theme: {theme}</StackLayout>
    </Card>
  );
};

export const Theme = (): ReactElement => {
  return (
    <SaltProvider theme="custom-theme">
      <ThemeCard />
    </SaltProvider>
  );
};
