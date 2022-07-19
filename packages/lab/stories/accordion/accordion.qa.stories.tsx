import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { ComponentType, ReactNode } from "react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components/QAContainer";
import { BackgroundBlock } from "docs/components/BackgroundBlock";

export default {
  title: "Lab/Accordion/QA",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

type PanelsData = {
  content: ReactNode;
  summary: ReactNode;
  expanded?: boolean;
  disabled?: boolean;
};

const panelsData: PanelsData[] = [
  {
    summary: "My first Panel",
    expanded: true,
    content: (
      <div>
        My first panel content <Link href="#">Link 1</Link>
      </div>
    ),
  },
  {
    summary: "My second Panel",
    disabled: true,
    content: (
      <div>
        My second panel content <Link href="#">Link 2</Link>
      </div>
    ),
  },

  {
    summary: "My third Panel",
    content: (
      <div>
        My third panel content <Link href="#">Link 2</Link>
      </div>
    ),
  },
];

export const AllExamplesGrid: Story = (props: {
  className?: string;
  imgSrc?: string;
}) => {
  return (
    <QAContainer cols={2} imgSrc={props.imgSrc}>
      <Accordion className={props.className}>
        {panelsData.map((panel) => {
          const { content, summary, disabled, expanded } = panel;
          return (
            <AccordionSection
              disabled={disabled}
              expanded={expanded}
              key={summary?.toString()}
            >
              <AccordionSummary>{summary}</AccordionSummary>
              <AccordionDetails>{content}</AccordionDetails>
            </AccordionSection>
          );
        })}
      </Accordion>
      <Accordion bordered className={props.className}>
        {panelsData.map((panel) => {
          const { content, summary, disabled, expanded } = panel;
          return (
            <AccordionSection
              disabled={disabled}
              expanded={expanded}
              key={summary?.toString()}
            >
              <AccordionSummary>{summary}</AccordionSummary>
              <AccordionDetails>{content}</AccordionDetails>
            </AccordionSection>
          );
        })}
      </Accordion>
    </QAContainer>
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

export const CompareWithOriginalToolkit = AllExamplesGrid.bind({});
CompareWithOriginalToolkit.args = {
  className: "backwardsCompat",
  imgSrc: "/visual-regression-screenshots/Accordion-vr-snapshot.png",
};
