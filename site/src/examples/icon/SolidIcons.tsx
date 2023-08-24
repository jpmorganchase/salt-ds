import { ReactElement } from "react";
import { AddDocumentIcon, AddDocumentSolidIcon } from "@salt-ds/icons";
import { FlowLayout } from "@salt-ds/core";

export const SolidIcons = (): ReactElement => (
  <FlowLayout>
    <AddDocumentIcon size={2} />
    <AddDocumentSolidIcon size={2} />
  </FlowLayout>
);
