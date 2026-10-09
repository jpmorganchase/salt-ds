import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
  Text,
} from "@salt-ds/core";
import type { ReactElement, SyntheticEvent } from "react";

const validate = (_event: SyntheticEvent, files: File[]) => {
  console.log("validate files", files);
};

export const Error = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
    status="error"
  >
    <FileDropZoneIcon status="error" />
    <Text styleAs="inherit" fontWeight="bolder">
      File format is not allowed
    </Text>
    <FileDropZoneTrigger accept=".png" onChange={validate} />
    <Text>Only .png files</Text>
  </FileDropZone>
);
