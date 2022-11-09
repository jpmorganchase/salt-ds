import { FileDropZone } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Lab/File Drop Zone/QA",
  component: FileDropZone,
} as ComponentMeta<typeof FileDropZone>;

export const AllExamplesGrid: ComponentStory<typeof FileDropZone> = (props) => {
  return (
    <AllRenderer>
      <FileDropZone onFilesAccepted={() => console.log("files accepted")} />
    </AllRenderer>
  );
};
