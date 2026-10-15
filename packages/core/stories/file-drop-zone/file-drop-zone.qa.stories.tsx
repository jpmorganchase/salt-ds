import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
  Text,
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
        <Text styleAs="inherit" fontWeight="bolder">
          Drop files here or
        </Text>
        <FileDropZoneTrigger />
      </FileDropZone>
      <FileDropZone
        className="saltFileDropZone-active"
        onDrop={() => console.log("files accepted")}
      >
        <FileDropZoneIcon />
        <Text styleAs="inherit" fontWeight="bolder">
          Drop files here or
        </Text>
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
