import { GridLayout, Label, Panel, StackLayout } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Panel",
  component: Panel,
} as Meta<typeof Panel>;

const Template: StoryFn<typeof Panel> = (args) => <Panel {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: "This is a Panel",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "This is a Panel",
  variant: "secondary",
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  children: "This is a Panel",
  variant: "tertiary",
};

export const FixedHeightAndWidth: StoryFn<typeof Panel> = () => (
  <Panel style={{ height: "500px", width: "800px" }} variant="secondary">
    <p>This is a Panel</p>
  </Panel>
);

export const PanelInGridLayout: StoryFn<typeof Panel> = () => (
  <GridLayout columns={2}>
    <Panel style={{ width: "100vh" }}>
      <p>This is a Panel</p>
    </Panel>
    <Panel variant="secondary" style={{ width: "100vh" }}>
      <p>This is a Panel</p>
    </Panel>
  </GridLayout>
);

export const Appearance: StoryFn<typeof Panel> = (args) => {
  const appearances = ["flat", "raised"] as const;
  return (
    <StackLayout direction="row">
      {appearances.map((appearance) => (
        <StackLayout align="end" key={appearance} style={{ width: "260px" }}>
          <Panel {...args} appearance={appearance}>
            This is a Panel
          </Panel>
          <Label>Appearance: {appearance}</Label>
        </StackLayout>
      ))}
    </StackLayout>
  );
};
