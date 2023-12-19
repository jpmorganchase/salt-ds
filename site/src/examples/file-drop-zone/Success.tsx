import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";
import {Text} from "@salt-ds/core";

export const Success = (): ReactElement => (
  <FileDropZone style={{ width: 300 }} status="success">
    <FileDropZoneIcon status="success" />
    <strong>Upload completed</strong>
    <FileDropZoneTrigger />
    <Text>Only .png files</Text>
  </FileDropZone>
);
