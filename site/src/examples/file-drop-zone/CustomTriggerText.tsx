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

export const CustomTriggerText = (): ReactElement => (
  <FileDropZone
    style={{ width: 300 }}
    onDrop={(event, files) => validate(event, files)}
  >
    <FileDropZoneIcon />
    <Text styleAs="inherit" fontWeight="bolder">
      Drop files here or
    </Text>
    <FileDropZoneTrigger accept=".png" onChange={validate}>
      Select from device
    </FileDropZoneTrigger>
    <Text>Only .png files</Text>
  </FileDropZone>
);
