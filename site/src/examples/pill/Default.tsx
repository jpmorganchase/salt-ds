import { Pill } from "@salt-ds/core";
import type { ReactElement } from "react";

const handleClick = () => {
  console.log("clicked");
};

export const Default = (): ReactElement => (
  <Pill onClick={handleClick}>Reserve seat</Pill>
);
