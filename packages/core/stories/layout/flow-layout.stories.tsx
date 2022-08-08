import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  StackLayout,
  Card,
  FormField,
} from "@jpmorganchase/uitk-core";
import {
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Metric,
  MetricHeader,
  MetricContent,
  Dropdown,
  ButtonBar,
  OrderedButton,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import {
  StackLayoutComposite,
  ComplexFormOne,
  ComplexFormTwo,
  ComplexFormThree,
  ComplexFormFour,
} from "./stack-layout.stories";
import { ContactDetailsExample } from "./flex-layout.stories";

export default {
  title: "Core/Layout/FlowLayout",
  component: FlowLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
      defaultValue: 3,
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
  },
  excludeStories: ["MetricExample", "DashboardExample"],
} as ComponentMeta<typeof FlowLayout>;

const DefaultFlowLayoutStory: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <FlexContent key={index} number={index + 1} />
      ))}
    </FlowLayout>
  );
};
export const DefaultFlowLayout = DefaultFlowLayoutStory.bind({});
DefaultFlowLayout.args = {};

export const MetricExample = () => (
  <Metric direction="up" size="large">
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
      <ComplexFormOne />
    </FlexItem>
    <FlexItem>
      <ComplexFormTwo />
    </FlexItem>
    <FlexItem>
      <ComplexFormThree />
    </FlexItem>
    <FlexItem>
      <ComplexFormFour />
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

const dropdownExampleData = [
  "Lorem ipsum dolor",
  "Commodo laboris",
  "Ipsum incididunt",
];

export const DashboardExample: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout className="flow-dashboard-container" {...args}>
      <FlexItem grow={1}>
        <Card>
          <FlowLayout>
            {Array.from({ length: 3 }, (_, index) => (
              <MetricExample key={index} />
            ))}
          </FlowLayout>
        </Card>
      </FlexItem>
      <FlexItem
        shrink={{ xs: 0, sm: 0, md: 1, lg: 1, xl: 1 }}
        grow={{ xs: 1, sm: 1, md: 0, lg: 0, xl: 0 }}
      >
        <Card>
          <StackLayout>
            {Array.from({ length: 5 }, (_, index) => (
              <ContactDetailsExample key={index} index={index} />
            ))}
          </StackLayout>
        </Card>
      </FlexItem>
      <FlexItem grow={1}>
        <Card>
          <StackLayout>
            {Array.from({ length: 6 }, (_, index) => (
              <FormField
                label="Preference 1"
                helperText="Help text appears here"
                key={index}
              >
                <Dropdown
                  defaultSelected={dropdownExampleData[0]}
                  source={dropdownExampleData}
                />
              </FormField>
            ))}
            <ButtonBar>
              <OrderedButton variant="cta">Save</OrderedButton>
              <OrderedButton>Cancel</OrderedButton>
            </ButtonBar>
          </StackLayout>
        </Card>
      </FlexItem>
    </FlowLayout>
  );
};
