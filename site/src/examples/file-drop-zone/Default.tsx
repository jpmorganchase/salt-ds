import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";

export const Default = (): ReactElement => (
  <FileDropZone style={{ width: 200 }}>
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger />
  </FileDropZone>
);
