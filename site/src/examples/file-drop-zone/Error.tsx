import { ReactElement } from "react";
import { Text } from "@salt-ds/core";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";

export const Error = (): ReactElement => (
  <FileDropZone style={{ width: 300 }} status="error">
    <FileDropZoneIcon status="error" />
    <strong>File format is not allowed</strong>
    <FileDropZoneTrigger accept=".png" />
    <Text>Only .png files</Text>
  </FileDropZone>
);
