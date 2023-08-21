import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";

const handleClick = () => {
  console.log("clicked");
};

export const Disabled = (): ReactElement => (
  <PillNext disabled onClick={handleClick}>
    Disabled Pill
  </PillNext>
);
