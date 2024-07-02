import { FlowLayout } from "@salt-ds/core";
import { AddDocumentIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconSize = (): ReactElement => (
  <FlowLayout>
    <AddDocumentIcon size={1} />
    <AddDocumentIcon size={2} />
    <AddDocumentIcon size={3} />
    <AddDocumentIcon size={4} />
  </FlowLayout>
);
