import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  StackLayout,
} from "@jpmorganchase/uitk-core";
import {
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
import {
  StackLayoutComposite,
  ComplexFormOne,
  ComplexFormTwo,
  ComplexFormThree,
  ComplexFormFour,
} from "./stack-layout.stories";

export default {
  title: "Core/Layout/FlowLayout",
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
      {Array.from({ length: 5 }, (_, index) => (
        <FlexContent key={index} />
      ))}
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
