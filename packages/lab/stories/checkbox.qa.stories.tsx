import { ComponentMeta, Story } from "@storybook/react";
import { Checkbox } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Checkbox/QA",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

export const AllExamplesGrid: Story<
  QAContainerProps & { className?: string }
> = ({ className, ...props }) => {
  return (
    <QAContainer cols={1} height={500} width={1200} {...props}>
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
        label="I understand ADA requires Labels on indeterminate checkboxes"
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
