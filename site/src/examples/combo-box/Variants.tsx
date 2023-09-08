import { ReactElement } from "react";
import { ComboBoxNext } from "@salt-ds/lab";
import { StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Variants = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <ComboBoxNext source={shortColorData} />
    <ComboBoxNext source={shortColorData} variant="secondary" />
  </StackLayout>
);
