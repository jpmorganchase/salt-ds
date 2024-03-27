import { GridLayout, Panel, SaltProvider, Text } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Core/Panel",
  component: Panel,
} as Meta<typeof Panel>;

const Template: StoryFn<typeof Panel> = (args) => <Panel {...args} />;

export const All: StoryFn<typeof Panel> = (props) => {
  return (
    <>
      <h1>Primary</h1>
      <AllRenderer>
        <Panel {...props} />
      </AllRenderer>
      <h1>Secondary</h1>
      <AllRenderer>
        <Panel variant="secondary" {...props} />
      </AllRenderer>
    </>
  );
};

All.args = {
  children: <p>This is a Panel</p>,
};
All.argTypes = {
  children: { control: { type: null } },
};

export const Primary = Template.bind({});
Primary.args = {
  children: "This is a Panel",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "This is a Panel",
  variant: "secondary",
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

export const NestedProvider: StoryFn<typeof Panel> = () => {
  return (
    <SaltProvider>
      <Panel
        style={{
          border: "1px solid var(--salt-container-primary-borderColor)",
        }}
      >
        <p>Paragraph in panel</p>
        <Text>Text component in panel</Text>
        Normal text in panel
        <Panel
          style={{
            border: "1px solid var(--salt-container-secondary-borderColor)",
          }}
        >
          <p>Paragraph in nested panel</p>
          <Text>Text component in nested panel</Text>
          Normal text in nested panel
        </Panel>
        <SaltProvider mode="dark">
          <Panel>
            <p>Paragraph in nested provider panel</p>
            <Text>Text component in nested provider panel</Text>
            Normal text in nested provider panel
          </Panel>
        </SaltProvider>
      </Panel>
    </SaltProvider>
  );
};
