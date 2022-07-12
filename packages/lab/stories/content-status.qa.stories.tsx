import { ContentStatus } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import "./content-status.qa.stories.css";

export default {
  title: "Lab/Content Status/QA",
  component: ContentStatus,
} as ComponentMeta<typeof ContentStatus>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer
      width={1600}
      height={900}
      cols={6}
      vertical
      className="uitkContentStatusQA"
      {...props}
    >
      <ContentStatus
        className={props.className}
        actionLabel="[CUSTOM ACTION]"
        message="Supplementary content can go here if required."
        status="warning"
        title="No permission to access [content]"
        onActionClick={() => {}}
      />
      <ContentStatus
        className={props.className}
        message="Supplementary content can go here if required."
        status="success"
      />
      <ContentStatus
        className={props.className}
        message="It should be temporary, so please try again."
        status="error"
        title="There's been a system error"
        actionLabel="RELOAD"
        onActionClick={() => {}}
      />
      <ContentStatus
        className={props.className}
        actionLabel="[CUSTOM ACTION]"
        message="Supplementary content can go here if required."
        title="No [content] available"
        onActionClick={() => {}}
      />
      <ContentStatus
        className={props.className}
        message="Supplementary content can go here if required."
        status="loading"
      />
      <ContentStatus
        className={props.className}
        message="Supplementary content can go here if required."
        status="loading"
        value={38}
      />
    </QAContainer>
  );
};

// export const AllExamplesGrid: Story = (props: { className?: string }) => {
//   const { className } = props;
//   return (
//     <QAContainer
//       width={1600}
//       height={900}
//       cols={4}
//       // itemWidthAuto
//       className="uitkContentStatusQA"
//     >
//       <ContentStatusExamples className={className} />
//     </QAContainer>
//   );
// };

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<
  typeof ContentStatus
> = () => {
  return (
    <AllExamplesGrid
      imgSrc="/visual-regression-screenshots/ContentStatus-vr-snapshot.png"
      className="backwardsCompat"
    />
  );
};
