import { Switch } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./switch.qa.stories.css";

export default {
  title: "Core/Switch/QA",
  component: Switch,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Switch>;

export const AllExamplesGrid: ComponentStory<typeof Switch> = (props) => {
  const { className } = props;
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
        <Switch className={className} key="Default" label="Default" />
        <Switch
          className={className}
          defaultChecked
          key="Default"
          label="Default"
        />
        <Switch className={className} disabled key="Default" label="Default" />
        <Switch
          className={className}
          defaultChecked
          disabled
          key="Default"
          label="Default"
        />
      </div>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
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
      <BackwardsCompatGrid className="backwardsCompat" />
    </QAContainer>
  );
};
