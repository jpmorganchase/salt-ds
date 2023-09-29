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
    <QAContainer cols={1} height={500} width={1200} {...props}>
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
      </CheckboxGroup>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
