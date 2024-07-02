import { TokenizedInputNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const handleChange = (selectedItems: unknown) => {
  console.log("selection changed", selectedItems);
};

export const Default = (): ReactElement => (
  <TokenizedInputNext style={{ width: "266px" }} onChange={handleChange} />
);
