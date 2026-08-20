import { CardContent, H3, LinkCard, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const LinkCardExample = (): ReactElement => {
  return (
    <LinkCard
      href="https://www.saltdesignsystem.com"
      rel="noreferrer"
      target="_blank"
      style={{ maxWidth: "100%", width: "320px" }}
      accent="top"
    >
      <CardContent>
        <StackLayout gap={1}>
          <H3 style={{ margin: 0 }}>Salt Design System</H3>
          <Text>
            Explore components, patterns, and guidance for building consistent
            digital experiences.
          </Text>
          <Text color="secondary">
            Visit the Salt website (opens in a new tab)
          </Text>
        </StackLayout>
      </CardContent>
    </LinkCard>
  );
};
