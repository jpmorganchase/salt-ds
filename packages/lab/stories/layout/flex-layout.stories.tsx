import {
  Checkbox,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { useState } from "react";

export default {
  title: "Layout/FlexLayout",
  component: FlexLayout,
  subcomponents: { FlexItem },
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    direction: {
      options: ["row", "column"],
      control: { type: "radio" },
    },
    gap: {
      type: "number",
    },
    justify: {
      options: FLEX_CONTENT_ALIGNMENT_BASE,
      control: { type: "select" },
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
    wrap: {
      type: "boolean",
    },
  },
} as ComponentMeta<typeof FlexLayout>;

const Template: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </FlexLayout>
  );
};
export const ToolkitFlexLayout = Template.bind({});
ToolkitFlexLayout.args = {};

const Responsive: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout
      wrap={{
        xs: true,
        sm: true,
        md: true,
        lg: false,
        xl: false,
      }}
      {...args}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <FlexItem grow={1} key={index}>
          <FlexContent />
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexLayoutResponsive = Responsive.bind({});
ToolkitFlexLayoutResponsive.args = {
  direction: {
    xs: "column",
    md: "row",
  },
  wrap: {
    xs: true,
    lg: false,
  },
};
ToolkitFlexLayoutResponsive.args = {};

const colorFormats = ["Hex", "HSV"];

const Forms: ComponentStory<typeof FlexLayout> = (args) => {
  const [showMode, setShowMode] = useState(colorFormats[0]);
  const [showContrast, setShowContrast] = useState(false);
  return (
    <FlexLayout {...args}>
      <FormField
        label="Show as"
        labelPlacement="left"
        className="ColorInpsector-preferences-showAs"
      >
        <Dropdown
          source={colorFormats}
          selectedItem={showMode}
          onChange={(_, item) => setShowMode(item || "")}
        />
      </FormField>
      <Checkbox
        label="Contrast"
        checked={showContrast}
        onChange={(_, checked) => setShowContrast(checked)}
      />
    </FlexLayout>
  );
};
export const ToolkitFormInFlexLayout = Forms.bind({});
ToolkitFormInFlexLayout.args = {
  gap: 1,
  wrap: {
    xs: true,
    sm: false,
  },
};
