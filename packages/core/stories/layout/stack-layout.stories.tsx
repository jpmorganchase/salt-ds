import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  StackLayout,
} from "@jpmorganchase/uitk-core";
import { Panel, FormField, Input } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Layout/StackLayout",
  component: StackLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof StackLayout>;

const DefaultStackLayoutStory: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </StackLayout>
  );
};
export const DefaultStackLayout = DefaultStackLayoutStory.bind({});
DefaultStackLayout.args = {};

const StackLayoutStorySimpleUsage: ComponentStory<typeof StackLayout> = (
  args
) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <Panel className="uitkEmphasisHigh">{`Panel ${index + 1} stack`}</Panel>
      ))}
    </StackLayout>
  );
};
export const StackLayoutSimpleUsage = StackLayoutStorySimpleUsage.bind({});
StackLayoutSimpleUsage.args = {};

const EmphasisFormField = () => (
  <FormField
    labelPlacement="left"
    label="Quis qui nisi"
    className="uitkEmphasisHigh"
  >
    <Input defaultValue="Lorem ipsum" />
  </FormField>
);

const Form: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 2 }, (_, index) => (
        <EmphasisFormField key={index} />
      ))}
      <FormField labelPlacement="left" label="Consectetur sint">
        <Input defaultValue="Nulla id Lorem Lorem" />
      </FormField>
      <EmphasisFormField />
      <FormField labelPlacement="left" label="Quis qui nisi">
        <Input defaultValue="Lorem ipsum" />
      </FormField>
    </StackLayout>
  );
};
export const StackLayoutComposite = Form.bind({});
StackLayoutComposite.args = {};
