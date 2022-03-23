import { Switch } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";

export default {
  title: "Lab/Switch/QA",
  component: Switch,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Switch>;

const SwitchExamples = [
  <Switch key="Default" label="Default" />,
  <Switch checked key="Default" label="Default" />,
  <Switch disabled key="Default" label="Default" />,
  <Switch checked disabled key="Default" label="Default" />,
];

export const CompareWithOriginalToolkit: ComponentStory<typeof Switch> = (
  props
) => {
  return (
    <QAContainer
      height={190}
      width={948}
      imgSrc="/visual-regression-screenshots/Switch-vr-snapshot.png"
    >
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
    </QAContainer>
  );
};
