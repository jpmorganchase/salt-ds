import { CSSProperties, ReactElement } from "react";
import { AddDocumentIcon } from "@salt-ds/icons";

export const Color = (): ReactElement => (
  <AddDocumentIcon
    style={
      {
        "--saltIcon-color": "var(--salt-status-info-foreground)",
      } as CSSProperties
    }
    size={2}
  />
);
