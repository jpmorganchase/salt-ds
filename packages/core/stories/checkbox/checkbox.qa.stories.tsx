import { Meta, StoryFn } from "@storybook/react";
import { Checkbox, CheckboxGroup, CheckboxGroupProps } from "@salt-ds/core";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Checkbox/Checkbox QA",
  component: Checkbox,
} as Meta<typeof Checkbox>;

const CheckboxGroupExample = ({
  direction,
}: Pick<CheckboxGroupProps, "direction">) => {
  return (
    <CheckboxGroup direction={direction}>
      <Checkbox label="I understand ADA requires Labels on unchecked checkboxes" />
      <Checkbox
        defaultChecked
        label="I understand ADA requires Labels on checked checkboxes"
      />
      <Checkbox
        defaultChecked
        indeterminate
        label="I understand ADA requires Labels on indeterminate checkboxes"
      />
      <Checkbox
        disabled
        label="I understand ADA requires Labels on disabled checkboxes"
      />
      <Checkbox
        readOnly
        label="I understand ADA requires Labels on read-only checkboxes"
      />
      <Checkbox
        readOnly
        label="Checkboxes allow the user to select multiple options from a set. If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead."
      />
    </CheckboxGroup>
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={1} itemPadding={8} {...props}>
      <CheckboxGroupExample direction="vertical" />
      <CheckboxGroupExample direction="horizontal" />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
