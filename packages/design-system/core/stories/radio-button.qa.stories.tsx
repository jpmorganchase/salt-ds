import { RadioButton, RadioButtonGroup } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Radio Button/QA",
  component: RadioButton,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof RadioButton>;

export const AllExamplesGrid: Story<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={2} itemPadding={6} itemWidthAuto {...props}>
      <RadioButtonGroup
        className={className}
        aria-label="Uncontrolled Example"
        defaultValue="forward"
        legend="Example"
      >
        <RadioButton key="spot" label="Spot" value="spot" />
        <RadioButton key="forward" label="Forward" value="forward" />
        <RadioButton
          disabled
          key="option"
          label="Option (disabled)"
          value="option"
        />
      </RadioButtonGroup>
      <RadioButtonGroup
        className={className}
        defaultValue="forward"
        legend="Example"
        name="fx"
        row
      >
        <RadioButton key="spot" label="Spot" value="spot" />
        <RadioButton key="forward" label="Forward" value="forward" />
        <RadioButton
          disabled
          key="option"
          label="Option (disabled)"
          value="option"
        />
      </RadioButtonGroup>
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
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/RadioButton-vr-snapshot.png"
    />
  );
};
