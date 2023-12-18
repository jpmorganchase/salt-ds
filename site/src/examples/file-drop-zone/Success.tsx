import { ReactElement } from "react";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger
} from "@salt-ds/lab";

export const Success = (): ReactElement => {

  return <FileDropZone style={{width: 200}} status="success">
    <FileDropZoneIcon status="success"/>
    <strong>Upload completed</strong>
    <FileDropZoneTrigger/>
  </FileDropZone>;
};
