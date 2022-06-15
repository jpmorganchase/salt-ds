import { ContentStatus } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./content-status.qa.stories.css";

export default {
  title: "Lab/Content Status/QA",
  component: ContentStatus,
} as ComponentMeta<typeof ContentStatus>;

export const AllExamplesGrid: ComponentStory<typeof ContentStatus> = () => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
      >
        <ContentStatus
          actionLabel="[CUSTOM ACTION]"
          message="Supplementary content can go here if required."
          status="warning"
          title="No permission to access [content]"
        />
        <ContentStatus
          message="Supplementary content can go here if required."
          status="success"
        />
        <ContentStatus
          message="It should be temporary, so please try again."
          status="error"
          title="There's been a system error"
          actionLabel="RELOAD"
        />
        <ContentStatus
          actionLabel="[CUSTOM ACTION]"
          message="Supplementary content can go here if required."
          title="No [content] available"
        />
        <ContentStatus
          message="Supplementary content can go here if required."
          status="loading"
        />
        <ContentStatus
          message="Supplementary content can go here if required."
          status="loading"
          value={38}
        />
      </div>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<
  typeof ContentStatus
> = () => {
  return (
    <QAContainer
      width={1460}
      height={1123}
      className="uitkContentStatusQA"
      imgSrc="/visual-regression-screenshots/ContentStatus-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};
