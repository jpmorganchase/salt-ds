import { ReactElement } from "react";
import { TokenizedInputNext } from "@salt-ds/lab";

const handleChange = (selectedItems: unknown) => {
  console.log("selection changed", selectedItems);
};

export const Default = (): ReactElement => (
  <TokenizedInputNext style={{ width: "266px" }} onChange={handleChange} />
);
