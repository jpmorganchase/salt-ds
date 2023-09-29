import { ReactElement } from "react";
import { Text } from "@salt-ds/core";

export const Styling = (): ReactElement => (
  <Text as="p" styleAs="h1">
    This paragraph is styled as a H1
  </Text>
);
