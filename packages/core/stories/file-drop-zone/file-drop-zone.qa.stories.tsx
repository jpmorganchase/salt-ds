import {
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Core/File Drop Zone/File Drop Zone QA",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

export const AllExamplesGrid: StoryFn<typeof FileDropZone> = () => {
  return (
    <AllRenderer>
      <FileDropZone onDrop={() => console.log("files accepted")}>
        <FileDropZoneIcon />
        <strong>Drop files here or</strong>
        <FileDropZoneTrigger />
      </FileDropZone>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
