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
      <FileDropZoneTrigger appearance="bordered" />
      <FileDropZoneTrigger appearance="transparent" />
      <FileDropZoneTrigger sentiment="accented" appearance="solid" />
      <FileDropZoneTrigger sentiment="accented" appearance="bordered" />
      <FileDropZoneTrigger sentiment="accented" appearance="transparent" />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
