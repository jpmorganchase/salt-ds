import { Eyebrow, H1, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const EditorialContent = (): ReactElement => (
  <StackLayout gap={1}>
    <Eyebrow>Market insights</Eyebrow>
    <H1 styleAs="editorial4">The year ahead</H1>
    <Text styleAs="bodyLarge">
      Use body large for introductory paragraphs that sit alongside editorial
      headings.
    </Text>
  </StackLayout>
);
