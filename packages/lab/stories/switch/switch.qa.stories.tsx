import { Switch } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Switch/QA",
  component: Switch,
} as Meta<typeof Switch>;

export const AllExamplesGrid: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={4} {...props}>
      <Switch className={className} label="Default" />
      <Switch className={className} checked label="Default" />
      <Switch className={className} disabled label="Default" />
      <Switch className={className} checked disabled label="Default" />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
