import { Meta, StoryFn } from "@storybook/react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Checkbox/QA",
  component: Checkbox,
} as Meta<typeof Checkbox>;

export const AllExamplesGrid: StoryFn<
  QAContainerProps & { className?: string }
> = ({ className, ...props }) => {
  return (
    <QAContainer cols={1} height={1200} {...props}>
      <CheckboxGroup>
        <Checkbox
          className={className}
          label="I understand ADA requires Labels on unchecked checkboxes"
        />
        <Checkbox
          className={className}
          defaultChecked
          label="I understand ADA requires Labels on checked checkboxes"
        />
        <Checkbox
          className={className}
          defaultChecked
          indeterminate
          label="I understand ADA requires Labels on indeterminate checkboxes"
        />
        <Checkbox
          className={className}
          disabled
          label="I understand ADA requires Labels on disabled checkboxes"
        />
        <Checkbox
          className={className}
          readOnly
          label="I understand ADA requires Labels on read-only checkboxes"
        />
        <Checkbox
          className={className}
          readOnly
          label="Checkboxes allow the user to select multiple options from a set. If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead."
        />
      </CheckboxGroup>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
