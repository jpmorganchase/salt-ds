import { ReactElement } from "react";
import { AddDocumentIcon } from "@salt-ds/icons";
import { StackLayout } from "@salt-ds/core";

export const IconColor = (): ReactElement => (
  <StackLayout>
    <AddDocumentIcon color="inherit" size={2} />
    <AddDocumentIcon color="primary" size={2} />
    <AddDocumentIcon color="secondary" size={2} />
  </StackLayout>
);
