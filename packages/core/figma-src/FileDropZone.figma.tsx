import figma from "@figma/code-connect";
import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "../src/file-drop-zone/";
import { Text } from "../src/text";

// https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=13686-109100&m=dev

// Validation criteria: true
// Validation text value: 500KB total file limit.

figma.connect(
  FileDropZone,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=13686-109100",
  {
    variant: { "Validation criteria": true },
    props: {
      status: figma.enum("State", {
        Error: "error",
        Success: "success",
      }),
      title: figma.textContent("Title"),
      detailText: figma.string("Validation text value"),
    },
    example: (props) => (
      <FileDropZone status={props.status}>
        <FileDropZoneIcon status={props.status} />
        <Text>
          <strong>{props.title}</strong>
        </Text>
        <FileDropZoneTrigger accept=".png" onChange={() => {}} />
        <Text>{props.detailText}</Text>
      </FileDropZone>
    ),
  },
);
figma.connect(
  FileDropZone,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=13686-109100",
  {
    variant: { "Validation criteria": false },
    props: {
      status: figma.enum("State", {
        Error: "error",
        Success: "success",
      }),
      title: figma.textContent("Title"),
    },
    example: (props) => (
      <FileDropZone status={props.status}>
        <FileDropZoneIcon status={props.status} />
        <Text>
          <strong>{props.title}</strong>
        </Text>
        <FileDropZoneTrigger accept=".png" onChange={() => {}} />
      </FileDropZone>
    ),
  },
);
