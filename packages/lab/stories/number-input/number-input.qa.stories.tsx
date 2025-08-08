import { NumberInput } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Number Input/Number Input QA",
  component: NumberInput,
} as Meta<typeof NumberInput>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer itemPadding={4} {...props}>
      <NumberInput
        decimalScale={2}
        defaultValue={0.5}
        max={10}
        min={-5}
        step={0.5}
      />
      <NumberInput
        decimalScale={3}
        defaultValue={-5}
        max={10}
        min={-5}
        step={1}
        textAlign={"center"}
      />
      <NumberInput
        decimalScale={1}
        defaultValue={5}
        max={5}
        min={0}
        step={1}
        textAlign={"right"}
      />
      <NumberInput
        decimalScale={2}
        defaultValue={5}
        max={10}
        min={-5}
        readOnly
        step={0.5}
      />
      <NumberInput
        decimalScale={2}
        defaultValue={5}
        disabled
        max={10}
        min={-5}
        step={0.5}
      />
      <NumberInput validationStatus="success" value={100} />
      <NumberInput validationStatus="error" value={100} />
      <NumberInput validationStatus="warning" value={100} />
      <NumberInput value={100} hideButtons />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
