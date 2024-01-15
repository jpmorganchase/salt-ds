import { ReactElement } from "react";
import { Pill } from "@salt-ds/lab";

const handleClick = () => {
  console.log("clicked");
};

export const Default = (): ReactElement => (
  <Pill onClick={handleClick}>Clickable Pill</Pill>
);
