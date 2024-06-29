import { FlowLayout } from "@salt-ds/core";
import { AddDocumentIcon, AddDocumentSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconTypes = (): ReactElement => (
  <FlowLayout>
    <AddDocumentIcon size={2} />
    <AddDocumentSolidIcon size={2} />
  </FlowLayout>
);
