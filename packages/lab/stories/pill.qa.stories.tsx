import { Pill } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./pill.qa.stories.css";

export default {
  title: "Lab/Pill/QA",
  component: Pill,
} as ComponentMeta<typeof Pill>;

export const ExamplesGrid: ComponentStory<typeof Pill> = (props) => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplate: "auto / repeat(4,auto)",
          gap: "4px",
          verticalAlign: "top",
        }}
      >
        <Pill label="Default Pill" />
        <Pill disabled label="Disabled Pill" />
        <Pill
          variant="closable"
          label="Closable Pill"
          onDelete={() => console.log("Deleted.")}
        />
        <Pill
          label="Extra extra long Pill label example."
          onClick={() => console.log("Clicked.")}
        />
      </div>
    </AllRenderer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Pill> = (
  props
) => {
  return (
    <QAContainer
      width={951}
      height={172}
      className="uitkPillQA"
      imgSrc="/visual-regression-screenshots/Pill-vr-snapshot.png"
    >
      <ExamplesGrid />
    </QAContainer>
  );
};
