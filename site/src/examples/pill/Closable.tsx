import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";

const handleClose = () => {
  console.log("closed");
};

export const Closable = (): ReactElement => (
  <PillNext onClose={handleClose}>Closable Pill</PillNext>
);
