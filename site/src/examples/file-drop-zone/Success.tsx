import { SyntheticEvent, ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
  Text,
} from "@salt-ds/core";

const validate = (event: SyntheticEvent, files: File[]) => {
  console.log("validate files", files);
};

export const Success = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
    status="success"
  >
    <FileDropZoneIcon status="success" />
    <strong>Upload completed</strong>
    <FileDropZoneTrigger accept=".png" onChange={validate} />
    <Text>Only .png files</Text>
  </FileDropZone>
);
