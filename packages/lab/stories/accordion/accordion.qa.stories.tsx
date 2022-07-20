import { ComponentMeta, Story } from "@storybook/react";
import { ReactNode } from "react";

import {
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components/QAContainer";

export default {
  title: "Lab/Accordion/QA",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

type PanelsData = {
  content: ReactNode;
  summary: ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
};

const panelsData: PanelsData[] = [
  {
    summary: "My first Panel",
    defaultExpanded: true,
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
          const { content, summary, disabled, defaultExpanded } = panel;
          return (
            <AccordionSection
              disabled={disabled}
              defaultExpanded={defaultExpanded}
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
          const { content, summary, disabled, defaultExpanded } = panel;
          return (
            <AccordionSection
              disabled={disabled}
              defaultExpanded={defaultExpanded}
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
