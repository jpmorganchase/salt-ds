import { Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Styling = (): ReactElement => (
  <Text as="p" styleAs="h1">
    This paragraph is styled as a H1
  </Text>
);
