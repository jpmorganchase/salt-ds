import { TokenizedInput } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";

export default {
  title: "Lab/Tokenized Input/QA",
  component: TokenizedInput,
} as Meta<typeof TokenizedInput>;

export const ExamplesGrid: StoryFn<typeof TokenizedInput> = (props) => {
  return (
    <QAContainer cols={2} height={250} width={1000}>
      <TokenizedInput
        initialSelectedItems={[
          "abc",
          "defghi",
          "jklm",
          "nopqrstu",
          "vwexyz",
          "very looooooooooong looooooooooong long pill",
        ]}
        onChange={undefined}
        style={{ maxWidth: 292, width: 200 }}
      />
      <TokenizedInput
        disabled
        initialSelectedItems={["Value 1", "Value 2", "Value 3"]}
        style={{ width: 200 }}
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
