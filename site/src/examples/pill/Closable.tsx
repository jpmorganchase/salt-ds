import { ReactElement } from "react";
import { Pill } from "@salt-ds/lab";
import { CloseIcon } from "@salt-ds/icons";

const handleClose = () => {
  console.log("closed");
};

export const Closable = (): ReactElement => (
  <Pill onClick={handleClose}>
    Closable Pill <CloseIcon />
  </Pill>
);
