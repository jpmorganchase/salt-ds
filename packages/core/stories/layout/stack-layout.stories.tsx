import {
  Button,
  FLEX_ALIGNMENT_BASE,
  FormField,
  Input,
  Panel,
  StackLayout,
} from "@jpmorganchase/uitk-core";
import { SearchIcon } from "@jpmorganchase/uitk-icons";
import { ButtonBar, OrderedButton, Dropdown } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Core/Layout/StackLayout",
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
    gap: {
      type: "number",
      defaultValue: 3,
    },
  },
  excludeStories: [
    "ComplexFormOne",
    "ComplexFormTwo",
    "ComplexFormThree",
    "ComplexFormFour",
  ],
} as ComponentMeta<typeof StackLayout>;

const DefaultStackLayoutStory: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <FlexContent key={index} number={index + 1} />
      ))}
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
const dropdownExampleData = ["No", "Yes"];

export const ComplexFormOne: ComponentStory<typeof StackLayout> = () => {
  return (
    <StackLayout align="center">
      <FormField labelPlacement="left" label="Lorem ipsum">
        <Input defaultValue="Culpa nisi exercitation" />
      </FormField>

      <FormField labelPlacement="left" label="Cupidatat minim deserunt">
        <Input defaultValue="Sunt exercitation" />
      </FormField>
      <FormField labelPlacement="left" label="Ullamco sunt sit occaecat">
        <Input defaultValue="Pariatur occaecat ipsum" />
      </FormField>
      <FormField
        label="Aperiam"
        className="uitkEmphasisHigh"
        labelPlacement="left"
        LabelProps={{
          displayedNecessity: "optional",
        }}
      >
        <Dropdown
          defaultSelected={dropdownExampleData[0]}
          source={dropdownExampleData}
        />
      </FormField>
    </StackLayout>
  );
};

export const ComplexFormTwo: ComponentStory<typeof StackLayout> = () => {
  return (
    <StackLayout align="center">
      <FormField
        labelPlacement="left"
        label="Neque porro quisquam"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Duis aute irure" endAdornment={<SearchIcon />} />
      </FormField>
      {Array.from({ length: 2 }, (_, index) => (
        <FormField labelPlacement="left" label="Quis qui nisi" key={index}>
          <Input defaultValue="Lorem ipsum" />
        </FormField>
      ))}
    </StackLayout>
  );
};

export const ComplexFormThree: ComponentStory<typeof StackLayout> = () => {
  return (
    <StackLayout align="center">
      <FormField labelPlacement="left" label="Anim do consequat nostru">
        <Input defaultValue="091839182893812893" />
      </FormField>

      <FormField labelPlacement="left" label="Dolore proident">
        <Input defaultValue="Id aute sit" />
      </FormField>
    </StackLayout>
  );
};

export const ComplexFormFour: ComponentStory<typeof StackLayout> = () => {
  return (
    <StackLayout align="center">
      <FormField labelPlacement="left" label="Quis qui nisi">
        <Input defaultValue="Lorem ipsum" />
      </FormField>
      <FormField
        labelPlacement="left"
        label="Exercitation veniam temp"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="e.g. Esse velit sunt do" />
      </FormField>
      {Array.from({ length: 2 }, (_, index) => (
        <FormField labelPlacement="left" label="Quis qui nisi" key={index}>
          <Input defaultValue="Lorem ipsum" />
        </FormField>
      ))}
    </StackLayout>
  );
};

const StackLayoutSeparatorsExample: ComponentStory<typeof StackLayout> = (
  args
) => {
  return (
    <StackLayout
      {...args}
      role="region"
      aria-label="Display contents with role example"
    >
      <Button>Button outside region</Button>
      <ButtonBar>
        <OrderedButton>Button in region 1</OrderedButton>
        <OrderedButton>Button in region 2</OrderedButton>
      </ButtonBar>
    </StackLayout>
  );
};
export const StackLayoutSeparators = StackLayoutSeparatorsExample.bind({});
StackLayoutSeparators.args = {
  align: "center",
  gap: 2,
  separators: true,
};
