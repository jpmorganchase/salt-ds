import { Switch } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import "./switch.qa.stories.css";

export default {
  title: "Core/Switch/QA",
  component: Switch,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Switch>;

export const AllExamplesGrid: Story<
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

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <BackwardsCompatGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/Switch-vr-snapshot.png"
    />
  );
};
