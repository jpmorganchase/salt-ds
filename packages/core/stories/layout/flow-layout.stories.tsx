import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  StackLayout,
} from "@jpmorganchase/uitk-core";
import {
  FormField,
  Input,
  Dropdown,
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Metric,
  MetricHeader,
  MetricContent,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { StackLayoutComposite } from "../../../core/stories/layout/stack-layout.stories";
import { SearchIcon } from "@jpmorganchase/uitk-icons";

export default {
  title: "Layout/FlowLayout",
  component: FlowLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
  },
  excludeStories: ["MetricExample"],
} as ComponentMeta<typeof FlowLayout>;

const DefaultFlowLayoutStory: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </FlowLayout>
  );
};
export const DefaultFlowLayout = DefaultFlowLayoutStory.bind({});
DefaultFlowLayout.args = {};

export const MetricExample = () => (
  <Metric direction="up">
    <MetricHeader subtitle="Total Value" title="Revenue YTD" />
    <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
  </Metric>
);

const FlowLayoutStorySimpleUsage: ComponentStory<typeof FlowLayout> = (
  args
) => {
  return (
    <div className="uitkEmphasisHigh flow-layout-container">
      <FlowLayout gap={2} {...args}>
        {Array.from({ length: 6 }, (_, index) => (
          <MetricExample key={index} />
        ))}
      </FlowLayout>
    </div>
  );
};

export const FlowLayoutSimpleUsage = FlowLayoutStorySimpleUsage.bind({});

const dropdownExampleData = ["No", "Yes"];

const RightForm = () => (
  <Accordion>
    {Array.from({ length: 6 }, (_, index) => (
      <AccordionSection key={index} defaultExpanded={index === 0}>
        <AccordionSummary>Expandable and collapsible section</AccordionSummary>
        <AccordionDetails>
          <StackLayoutComposite />
        </AccordionDetails>
      </AccordionSection>
    ))}
  </Accordion>
);

const leftFormContent = (
  <>
    <FlexItem>
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
            initialSelectedItem={dropdownExampleData[0]}
            source={dropdownExampleData}
          />
        </FormField>
      </StackLayout>
    </FlexItem>
    <FlexItem>
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
    </FlexItem>
    <FlexItem>
      <StackLayout align="center">
        <FormField labelPlacement="left" label="Anim do consequat nostru">
          <Input defaultValue="091839182893812893" />
        </FormField>

        <FormField labelPlacement="left" label="Dolore proident">
          <Input defaultValue="Id aute sit" />
        </FormField>
      </StackLayout>
    </FlexItem>
    <FlexItem>
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
    </FlexItem>
  </>
);

const LeftForm = () => (
  <>
    {leftFormContent}
    {leftFormContent}
    {leftFormContent}
  </>
);

const Form: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <div className="flow-layout-form-container">
      <form>
        <FlowLayout {...args}>
          <FlexItem grow={1}>
            <StackLayout separators>
              <LeftForm />
            </StackLayout>
          </FlexItem>
          <FlexItem grow={1}>
            <StackLayout>
              <RightForm />
            </StackLayout>
          </FlexItem>
        </FlowLayout>
      </form>
    </div>
  );
};
export const FlowLayoutComposite = Form.bind({});

FlowLayoutComposite.args = {
  separators: true,
};
