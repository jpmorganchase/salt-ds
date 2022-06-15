import { FileDropZone } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./file-drop-zone.qa.stories.css";

export default {
  title: "Lab/File Drop Zone/QA",
  component: FileDropZone,
} as ComponentMeta<typeof FileDropZone>;

export const AllExamplesGrid: ComponentStory<typeof FileDropZone> = (props) => {
  return (
    <AllRenderer>
      <FileDropZone
        className="backwardsCompat"
        onFilesAccepted={() => console.log("files accepted")}
      />
    </AllRenderer>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<typeof FileDropZone> = (
  props
) => {
  return (
    <QAContainer
      width={555}
      height={763}
      className="uitkFileDropZoneQA"
      imgSrc="/visual-regression-screenshots/FileDropZone-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};
