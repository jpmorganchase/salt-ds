import { TokenizedInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Lab/Tokenized Input/QA",
  component: TokenizedInput,
} as Meta<typeof TokenizedInput>;

export const ExamplesGrid: StoryFn<typeof TokenizedInput> = (props) => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplate: "auto / repeat(4,auto)",
          gap: "4px",
        }}
      >
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
      </div>
    </AllRenderer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
