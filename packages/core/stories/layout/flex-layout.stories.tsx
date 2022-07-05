import {
  Card,
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  FlexItem,
  FlexLayout,
  LAYOUT_DIRECTION,
} from "@jpmorganchase/uitk-core";
import {
  Metric,
  MetricContent,
  MetricHeader,
  ContactAvatar,
  ContactDetails,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Core/Layout/FlexLayout",
  component: FlexLayout,
  subcomponents: { FlexItem },
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    direction: {
      options: LAYOUT_DIRECTION,
      control: { type: "select" },
    },
    gap: {
      type: "number",
      defaultValue: 3,
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
      control: "boolean",
    },
  },
  args: {
    wrap: true,
  },
  excludeStories: ["ContactDetailsExample", "FlexLayoutNestedExample"],
} as ComponentMeta<typeof FlexLayout>;

const DefaultFlexLayoutStory: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <FlexContent key={index} />
      ))}
    </FlexLayout>
  );
};
export const DefaultFlexLayout = DefaultFlexLayoutStory.bind({});

const SeparatedItemsStory: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem>
          <FlexContent key={index} />
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const FlexLayoutWithSeparators = SeparatedItemsStory.bind({});
FlexLayoutWithSeparators.args = {
  separators: "center",
};

const Responsive: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 6 }, (_, index) => (
        <FlexContent key={index} />
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexLayoutResponsive = Responsive.bind({});
ToolkitFlexLayoutResponsive.args = {
  justify: "center",
  direction: {
    xs: "column",
    md: "row",
  },
  wrap: {
    xs: true,
    lg: false,
  },
};

const FlexLayoutStorySimpleUsage: ComponentStory<typeof FlexLayout> = (
  args
) => {
  return (
    <div style={{ background: "#EAEDEF", padding: 24 }}>
      <FlexLayout {...args}>
        {Array.from({ length: 5 }, (_, index) => (
          <Metric key={index}>
            <MetricHeader title={`Form Stage ${index + 1}`} />
            <MetricContent value="Complete" />
          </Metric>
        ))}
        <Metric>
          <MetricHeader title="Form Stage 6" />
          <MetricContent value="Pending" />
        </Metric>
      </FlexLayout>
    </div>
  );
};
export const FlexLayoutSimpleUsage = FlexLayoutStorySimpleUsage.bind({});

export const ContactDetailsExample = ({ index }: { index: number }) => (
  <ContactDetails embedded={true}>
    <ContactAvatar />
    <ContactPrimaryInfo text={`Contact ${index + 1}`} />
    <ContactSecondaryInfo text="Blackrock Advisors (UK) Limited" />
    <ContactTertiaryInfo text="SPN 2188538" />
    <ContactMetadata collapsible={true}>
      <ContactMetadataItem value="Analyst" label="Role" />
      <ContactMetadataItem value="London, GBR" label="Location" />
      <ContactMetadataItem value="+44 2077 431102" label="Office" />

      <ContactMetadataItem value="alex.brailescu@blackrock.com" label="Email" />
    </ContactMetadata>
  </ContactDetails>
);

const ContactCards: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <FlexItem grow={1} key={index}>
          <Card style={{ minWidth: 360 }}>
            <ContactDetailsExample key={index} index={index} />
          </Card>
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const FlexLayoutComposite = ContactCards.bind({});

const FlexLayoutNestedExample: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      <Card style={{ minWidth: 150 }}>
        <ContactDetailsExample index={0} />
      </Card>
      <FlexLayout>
        <Card style={{ minWidth: 150 }}>
          <ContactDetailsExample index={1} />
        </Card>
        <Card style={{ minWidth: 150 }}>
          <ContactDetailsExample index={2} />
        </Card>
      </FlexLayout>
    </FlexLayout>
  );
};
export const FlexLayoutNested = FlexLayoutNestedExample.bind({});
FlexLayoutNested.args = {
  justify: "space-between",
  gap: 6,
};
