import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";

export const Disabled = (): ReactElement => (
  <FileDropZone style={{ width: 200 }} disabled>
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger disabled />
  </FileDropZone>
);
