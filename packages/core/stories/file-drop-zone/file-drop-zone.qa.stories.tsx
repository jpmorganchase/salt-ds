import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
export default {
  title: "Core/File Drop Zone/File Drop Zone QA",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

export const AllExamplesGrid: StoryFn = () => {
  return (
    <QAContainer cols={2} itemPadding={4}>
      <FileDropZone onDrop={() => console.log("files accepted")}>
        <FileDropZoneIcon />
        <strong>Drop files here or</strong>
        <FileDropZoneTrigger />
      </FileDropZone>
      <FileDropZone
        className="saltFileDropZone-active"
        onDrop={() => console.log("files accepted")}
      >
        <FileDropZoneIcon />
        <strong>Drop files here or</strong>
        <FileDropZoneTrigger />
      </FileDropZone>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
