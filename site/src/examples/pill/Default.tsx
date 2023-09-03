import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";

const handleClick = () => {
  console.log("clicked");
};

export const Default = (): ReactElement => (
  <PillNext onClick={handleClick}>Clickable Pill</PillNext>
);
