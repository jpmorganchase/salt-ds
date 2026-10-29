import { StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Weight = (): ReactElement => (
  <StackLayout>
    <Text fontWeight="lighter">This is a lighter font weight</Text>
    <Text>This is the default font weight</Text>
    <Text fontWeight="bolder">This is a bolder font weight</Text>
    <Text>
      This text has a{" "}
      <Text as="span" styleAs="inherit" fontWeight="lighter">
        lighter
      </Text>
      , a <b>bold</b> and an <strong>important</strong> word
    </Text>
  </StackLayout>
);
