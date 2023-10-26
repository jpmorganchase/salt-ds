import { Switch } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Switch/QA",
  component: Switch,
} as Meta<typeof Switch>;

export const AllExamplesGrid: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={4} {...props}>
      <Switch className={className} label="Default" />
      <Switch className={className} checked label="Checked" />
      <Switch className={className} disabled label="Disabled" />
      <Switch
        className={className}
        checked
        disabled
        label="Checked + Disabled"
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
