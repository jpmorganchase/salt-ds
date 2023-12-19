import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";
import { Text } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
  <FileDropZone style={{ width: 300 }} disabled>
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger disabled />
    <Text>Only .png files</Text>
  </FileDropZone>
);
