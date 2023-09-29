import { Pill } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Pill/QA",
  component: Pill,
} as Meta<typeof Pill>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <Pill className={className} label="Default Pill" />
      <Pill className={className} label="Closable Pill" variant="closable" />
      <Pill
        className={className}
        label="Selectable Pill"
        variant="selectable"
      />
      <Pill className={className} disabled label="Disabled Pill" />
      <Pill
        className={className}
        label="Extra extra long Pill label example."
      />
      <Pill
        className={className}
        checked
        label="Selectable Pill"
        variant="selectable"
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
