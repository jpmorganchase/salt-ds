import { FlexLayout, StatusIndicator, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithText = (): ReactElement => (
  <FlexLayout gap={0.75}>
    <StatusIndicator
      aria-hidden
      status="error"
      style={{
        marginTop:
          "calc((var(--salt-text-label-lineHeight) - max(var(--salt-size-icon), 12px)) / 2)",
      }}
    />
    <Text
      color="error"
      styleAs="label"
      style={{ fontStyle: "var(--salt-typography-textDecoration-italic)" }}
    >
      Request could not be submitted. Please try again later.
    </Text>
  </FlexLayout>
);
