import { FileDropZone } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Lab/File Drop Zone/QA",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

export const AllExamplesGrid: StoryFn<typeof FileDropZone> = (props) => {
  return (
    <AllRenderer>
      <FileDropZone onFilesAccepted={() => console.log("files accepted")} />
    </AllRenderer>
  );
};
