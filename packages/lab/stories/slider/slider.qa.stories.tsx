import { Slider } from "@salt-ds/lab";
import { StoryFn, Meta } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Slider/Slider QA",
  component: Slider,
} as Meta<typeof Slider>;

export const Default: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Slider style={{ width: "300px" }} />
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BottomLabel: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Slider style={{ width: "300px" }} marks="bottom" defaultValue={[5]} />
    </QAContainer>
  );
};

BottomLabel.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WithMarks: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Slider
        style={{ width: "300px" }}
        marks="all"
        step={2}
        defaultValue={[4]}
      />
    </QAContainer>
  );
};

WithMarks.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Range: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Slider
        style={{ width: "300px" }}
        marks="bottom"
        step={2}
        min={0}
        max={50}
        defaultValue={[10, 40]}
      />
    </QAContainer>
  );
};

Range.parameters = {
  chromatic: { disableSnapshot: false },
};
