import { DragEvent, ReactElement } from "react";
import { Text } from "@salt-ds/core";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/lab";

const validate = (event: DragEvent<HTMLDivElement>, files: File[]) => {
  console.log("validate files", files);
};

export const Error = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
    status="error"
  >
    <FileDropZoneIcon status="error" />
    <strong>File format is not allowed</strong>
    <FileDropZoneTrigger accept=".png" />
    <Text>Only .png files</Text>
  </FileDropZone>
);
