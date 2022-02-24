import { FC, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionDetailsProps,
  AccordionProps,
  AccordionSection,
  AccordionSectionProps,
  AccordionSummary,
  AccordionSummaryProps,
} from "@brandname/lab";
import { TriangleUpIcon } from "@brandname/icons";
import { ComponentMeta, Story } from "@storybook/react";
import "./accordion.stories.css";

import { CustomSummary } from "./accordion/CustomSummary";

export default {
  title: "Lab/Accordion",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

const DetailsContent: FC = ({ children }) => {
  return <div className={"accordion-story-details"}>{children}</div>;
};

const MountainsAndHills = () => (
  <DetailsContent>
    <p>Scotland: Ben Nevis, 1,345 metres</p>
    <p>Wales: Snowdon (Snowdonia), 1,085 metres</p>
    <p>England: Scafell Pike (Cumbrian Mountains), 978 metres</p>
    <p>Northern Ireland: Slieve Donard (Mourne Mountains), 852 metres</p>
  </DetailsContent>
);

const RiversAndLakes = () => (
  <DetailsContent>
    <p>England: River Thames (215 mi; 346 km)</p>
    <p>Scotland: River Tay (117 mi; 188 km)</p>
    <p>N. Ireland: River Bann (76 mi; 122 km)</p>
    <p>Wales: River Tywi (64 mi; 103 km)</p>
  </DetailsContent>
);

const Islands = () => (
  <DetailsContent>
    <p>Barrow Island</p>
    <p>Bawden Rocks</p>
    <p>Brownsea Island</p>
    <p>Canvey Island</p>
    <p>Coquet Island</p>
    <p>Drake's Island</p>
  </DetailsContent>
);

interface DummySectionsProps {
  sectionProps?: AccordionSectionProps;
  summaryProps?: AccordionSummaryProps;
  detailsProps?: AccordionDetailsProps;
}

const renderDummySections = (props?: DummySectionsProps) => {
  const sectionProps = props?.sectionProps || {};
  const summaryProps = props?.summaryProps || {};
  const detailsProps = props?.detailsProps || {};
  return [
    <AccordionSection
      className={"accordion"}
      key={"mountains-and-hills"}
      {...sectionProps}
    >
      <AccordionSummary {...summaryProps}>Mountains and hills</AccordionSummary>
      <AccordionDetails {...detailsProps}>
        <MountainsAndHills />
      </AccordionDetails>
    </AccordionSection>,
    <AccordionSection
      className={"accordion"}
      key={"rivers-and-lakes"}
      {...sectionProps}
    >
      <AccordionSummary {...summaryProps}>Rivers and lakes</AccordionSummary>
      <AccordionDetails {...detailsProps}>
        <RiversAndLakes />
      </AccordionDetails>
    </AccordionSection>,
    <AccordionSection className={"accordion"} key={"islands"} {...sectionProps}>
      <AccordionSummary {...summaryProps}>Islands</AccordionSummary>
      <AccordionDetails {...detailsProps}>
        <Islands />
      </AccordionDetails>
    </AccordionSection>,
  ];
};

interface AccordionStoryProps {
  disabled?: boolean;
}

const AccordionTemplate: Story<AccordionStoryProps> = (props) => {
  return (
    <div className="story-root">
      <Accordion maxExpandedItems={1} disabled={props.disabled}>
        {renderDummySections()}
      </Accordion>
    </div>
  );
};

const ControlledAccordionTemplate: Story<AccordionStoryProps> = (props) => {
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([]);

  const onChange = (newValue: string[] | null) => {
    setExpandedSectionIds(newValue || []);
  };

  return (
    <div className="story-root">
      <Accordion expandedSectionIds={expandedSectionIds} onChange={onChange}>
        {renderDummySections()}
      </Accordion>
    </div>
  );
};

const StyledAccordionTemplate: Story<AccordionStoryProps> = (props) => {
  const dummySectionsProps = {
    summaryProps: { icon: <TriangleUpIcon /> },
  };
  return (
    <div className="story-root">
      <Accordion
        maxExpandedItems={1}
        disabled={props.disabled}
        className="accordion-styled"
      >
        {renderDummySections(dummySectionsProps)}
      </Accordion>
    </div>
  );
};

const MultiAccordionTemplate: Story<AccordionProps> = (props) => {
  return (
    <div className="story-root">
      <Accordion {...props}>{renderDummySections()}</Accordion>
    </div>
  );
};

const AccordionInAccordionTemplate: Story<AccordionProps> = () => {
  return (
    <div className="story-root">
      <Accordion>
        <AccordionSection className={"accordion"} key={"Geography"}>
          <AccordionSummary>Geography</AccordionSummary>
          <AccordionDetails>{renderDummySections()}</AccordionDetails>
        </AccordionSection>
        <AccordionSection className={"accordion"} key={"Climate"}>
          <AccordionSummary>Climate</AccordionSummary>
          <AccordionDetails>
            <p>
              Most of the United Kingdom has a temperate climate, with generally
              cool temperatures and plentiful rainfall all year round.
            </p>
          </AccordionDetails>
        </AccordionSection>
      </Accordion>
    </div>
  );
};

const CustomSummaryTemplate: Story<AccordionProps> = (props) => {
  return (
    <div className="story-root">
      <Accordion {...props}>
        <AccordionSection className={"accordion"}>
          <CustomSummary>Mountains and hills</CustomSummary>
          <AccordionDetails>
            <MountainsAndHills />
          </AccordionDetails>
        </AccordionSection>
        <AccordionSection className={"accordion"}>
          <CustomSummary>Rivers and lakes</CustomSummary>
          <AccordionDetails>
            <RiversAndLakes />
          </AccordionDetails>
        </AccordionSection>
        <AccordionSection className={"accordion"}>
          <CustomSummary>Islands</CustomSummary>
          <AccordionDetails>
            <Islands />
          </AccordionDetails>
        </AccordionSection>
      </Accordion>
    </div>
  );
};

export const DefaultAccordion = AccordionTemplate.bind({});

export const ControlledAccordion = ControlledAccordionTemplate.bind({});

export const DefaultMultiAccordion = MultiAccordionTemplate.bind({});

export const AccordionInAccordion = AccordionInAccordionTemplate.bind({});

export const StyledAccordion = StyledAccordionTemplate.bind({});

export const AccordionWithCustomSummary = CustomSummaryTemplate.bind({});

DefaultAccordion.args = {
  disabled: false,
};

DefaultMultiAccordion.args = {
  maxExpandedItems: 2,
};

StyledAccordion.args = {};
