import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";

export const Error = (): ReactElement => (
  <FileDropZone style={{ width: 200 }} status="error">
    <FileDropZoneIcon status="error" />
    <strong>Error uploading</strong>
    <FileDropZoneTrigger accept=".png" />
    <p>Only .png files</p>
  </FileDropZone>
);
