import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";
import { CloseIcon } from "@salt-ds/icons";

const handleClose = () => {
  console.log("closed");
};

export const Closable = (): ReactElement => (
  <PillNext onClick={handleClose}>
    Closable Pill <CloseIcon />
  </PillNext>
);
