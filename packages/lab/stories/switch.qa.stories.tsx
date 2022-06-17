import { Switch } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./switch.qa.stories.css";

export default {
  title: "Lab/Switch/QA",
  component: Switch,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Switch>;

const SwitchExamples = [
  <Switch className="backwardsCompat" key="Default" label="Default" />,
  <Switch
    className="backwardsCompat"
    defaultChecked
    key="Default"
    label="Default"
  />,
  <Switch className="backwardsCompat" disabled key="Default" label="Default" />,
  <Switch
    className="backwardsCompat"
    defaultChecked
    disabled
    key="Default"
    label="Default"
  />,
];

export const AllExamplesGrid: ComponentStory<typeof Switch> = (props) => {
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
        {SwitchExamples.map((s) => (
          <>{s}</>
        ))}
      </div>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Switch> = (
  props
) => {
  return (
    <QAContainer
      width={948}
      className="uitkSwitchQA"
      imgSrc="/visual-regression-screenshots/Switch-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};
