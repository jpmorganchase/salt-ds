import { useState, ReactNode, SyntheticEvent, ComponentType } from "react";
import {
  AccordionGroup,
  AccordionPanel,
  AccordionGroupProps,
  Accordion,
  AccordionHeader,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import "./accordion.stories.css";

export default {
  title: "Lab/Accordion",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

const PanelContent = ({ children }: { children?: ReactNode }) => {
  return <div className="panel-content">{children}</div>;
};

const MountainsAndHills = () => (
  <PanelContent>
    <p>Scotland: Ben Nevis, 1,345 metres</p>
    <p>Wales: Snowdon (Snowdonia), 1,085 metres</p>
    <p>England: Scafell Pike (Cumbrian Mountains), 978 metres</p>
    <p>Northern Ireland: Slieve Donard (Mourne Mountains), 852 metres</p>
  </PanelContent>
);

const RiversAndLakes = () => (
  <PanelContent>
    <p>England: River Thames (215 mi; 346 km)</p>
    <p>Scotland: River Tay (117 mi; 188 km)</p>
    <p>N. Ireland: River Bann (76 mi; 122 km)</p>
    <p>Wales: River Tywi (64 mi; 103 km)</p>
  </PanelContent>
);

const Islands = () => (
  <PanelContent>
    <p>Barrow Island</p>
    <p>Bawden Rocks</p>
    <p>Brownsea Island</p>
    <p>Canvey Island</p>
    <p>Coquet Island</p>
    <p>Drake's Island</p>
  </PanelContent>
);

interface AccordionStoryProps {
  disabled?: boolean;
}

const accordions = ["Mountains and hills", "Rivers and lakes", "Islands"];
const contentMap: Record<string, ComponentType> = {
  "Mountains and hills": MountainsAndHills,
  "Rivers and lakes": RiversAndLakes,
  Islands,
};

const AccordionTemplate: Story<AccordionStoryProps> = (props) => (
  <div className="story-root">
    <AccordionGroup>
      {accordions.map((accordion) => {
        const Content = contentMap[accordion];
        return (
          <Accordion value={accordion} disabled={props.disabled}>
            <AccordionHeader>{accordion}</AccordionHeader>
            <AccordionPanel>
              <Content />
            </AccordionPanel>
          </Accordion>
        );
      })}
    </AccordionGroup>
  </div>
);

const ControlledAccordionTemplate: Story<AccordionStoryProps> = (props) => {
  const [expanded, setExpanded] = useState<string>("");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    setExpanded((old) => (old === value ? "" : value));
  };

  return (
    <div className="story-root">
      <AccordionGroup>
        {accordions.map((accordion) => {
          const Content = contentMap[accordion];
          return (
            <Accordion
              expanded={expanded === accordion}
              onToggle={onChange}
              value={accordion}
              disabled={props.disabled}
            >
              <AccordionHeader>{accordion}</AccordionHeader>
              <AccordionPanel>
                <Content />
              </AccordionPanel>
            </Accordion>
          );
        })}
      </AccordionGroup>
    </div>
  );
};

const MultiAccordionTemplate: Story<AccordionGroupProps> = () => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    setExpanded((old) =>
      old.includes(value) ? old.filter((v) => v !== value) : [...old, value]
    );
  };

  return (
    <div className="story-root">
      <AccordionGroup>
        {accordions.map((accordion) => {
          const Content = contentMap[accordion];
          return (
            <Accordion
              expanded={expanded.includes(accordion)}
              onToggle={onChange}
              value={accordion}
            >
              <AccordionHeader>{accordion}</AccordionHeader>
              <AccordionPanel>
                <Content />
              </AccordionPanel>
            </Accordion>
          );
        })}
      </AccordionGroup>
    </div>
  );
};

const AccordionInAccordionTemplate: Story = () => {
  return (
    <div className="story-root">
      <AccordionGroup>
        <Accordion value="Geography">
          <AccordionHeader>Geography</AccordionHeader>
          <AccordionPanel>
            <PanelContent>
              {accordions.map((accordion) => {
                const Content = contentMap[accordion];
                return (
                  <Accordion key={accordion} value={accordion}>
                    <AccordionHeader>{accordion}</AccordionHeader>
                    <AccordionPanel>
                      <Content />
                    </AccordionPanel>
                  </Accordion>
                );
              })}
            </PanelContent>
          </AccordionPanel>
        </Accordion>
        <Accordion value="Climate">
          <AccordionHeader>Climate</AccordionHeader>
          <AccordionPanel>
            <p>
              Most of the United Kingdom has a temperate climate, with generally
              cool temperatures and plentiful rainfall all year round.
            </p>
          </AccordionPanel>
        </Accordion>
      </AccordionGroup>
    </div>
  );
};

export const Default = AccordionTemplate.bind({});

export const Controlled = ControlledAccordionTemplate.bind({});

export const DefaultMulti = MultiAccordionTemplate.bind({});

export const AccordionInAccordion = AccordionInAccordionTemplate.bind({});

Default.args = {
  disabled: false,
};
