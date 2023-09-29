import { ContentStatus } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Content Status/QA",
  component: ContentStatus,
} as Meta<typeof ContentStatus>;

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={4} height={1050} {...props}>
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

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
