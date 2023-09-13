import { ReactElement } from "react";
import { ComboBoxNext } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const Disabled = (): ReactElement => {
  return (
    <ComboBoxNext
      style={{ width: "266px" }}
      source={shortColorData}
      defaultSelected="Yellow"
      disabled
    />
  );
};
