import { Pill } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import "./pill.qa.stories.css";

export default {
  title: "Core/Pill/QA",
  component: Pill,
} as ComponentMeta<typeof Pill>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...props}>
      <Pill className="backwardsCompat" label="Default Pill" />
      <Pill
        className="backwardsCompat"
        label="Closable Pill"
        variant="closable"
      />
      <Pill
        className="backwardsCompat"
        label="Selectable Pill"
        variant="selectable"
      />
      <Pill className="backwardsCompat" disabled label="Disabled Pill" />
      <Pill
        className="backwardsCompat"
        label="Extra extra long Pill label example."
      />
      <Pill
        className="backwardsCompat"
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

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <ExamplesGrid imgSrc="/visual-regression-screenshots/Pill-vr-snapshot.png" />
  );
};
