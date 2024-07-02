import { StackLayout } from "@salt-ds/core";
import { AddDocumentIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconColor = (): ReactElement => (
  <StackLayout>
    <AddDocumentIcon color="inherit" size={2} />
    <AddDocumentIcon color="primary" size={2} />
    <AddDocumentIcon color="secondary" size={2} />
  </StackLayout>
);
