import { TokenizedInput } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./tokenizedinput.qa.stories.css";

export default {
  title: "Lab/Tokenized Input/QA",
  component: TokenizedInput,
} as ComponentMeta<typeof TokenizedInput>;

export const ExamplesGrid: ComponentStory<typeof TokenizedInput> = (props) => {
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

export const CompareWithOriginalToolkit: ComponentStory<
  typeof TokenizedInput
> = (props) => {
  return (
    <QAContainer
      width={864}
      height={235}
      className="uitkTokenizedInputQA"
      imgSrc="/visual-regression-screenshots/TokenizedInput-vr-snapshot.png"
      style={{ display: "flex" }}
    >
      <ExamplesGrid />
    </QAContainer>
  );
};
