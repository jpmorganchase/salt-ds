import { Pill } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

const handleClose = () => {
  console.log("closed");
};

export const Closable = (): ReactElement => (
  <Pill onClick={handleClose}>
    Closable Pill <CloseIcon aria-hidden="true" style={{ marginLeft: "auto" }} />
  </Pill>
);
