import { Card, SaltProviderNext, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const BrandTheme = (): ReactElement => {
  return (
    <SaltProviderNext
      accent="teal"
      corner="rounded"
      headingFont="Amplitude"
      actionFont="Amplitude"
    >
      <Card style={{ minHeight: "unset" }}>
        <StackLayout>
          <Text>Branded content</Text>
        </StackLayout>
      </Card>
    </SaltProviderNext>
  );
};
