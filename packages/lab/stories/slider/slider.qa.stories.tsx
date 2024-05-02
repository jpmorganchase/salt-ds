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
      <Slider style={{ width: "300px" }} labels="bottom" defaultValue={5} />
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
        labels="marks"
        step={2}
        defaultValue={4}
      />
    </QAContainer>
  );
};

WithMarks.parameters = {
  chromatic: { disableSnapshot: false },
};
