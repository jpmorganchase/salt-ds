import { Pill } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import "./pill.qa.stories.css";

export default {
  title: "Core/Pill/QA",
  component: Pill,
} as ComponentMeta<typeof Pill>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <Pill className="backwardsCompat" label="Default Pill" />
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

export const BackwardsCompatGrid: Story = () => {
  return <ExamplesGrid className="backwardsCompat" />;
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <ExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/Pill-vr-snapshot.png"
    />
  );
};
