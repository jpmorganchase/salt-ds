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

export const Disabled = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
    disabled
  >
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger accept=".png" disabled onChange={validate} />
    <Text disabled>Only .png files</Text>
  </FileDropZone>
);
