import { ReactElement, DragEvent } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
  Text,
} from "@salt-ds/core";

const validate = (event: DragEvent<HTMLDivElement>, files: File[]) => {
  console.log("validate files", files);
};

export const Default = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
  >
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger accept=".png" />
    <Text>Only .png files</Text>
  </FileDropZone>
);
