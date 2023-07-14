import { useState, ReactNode, SyntheticEvent, ComponentType } from "react";
import {
  AccordionGroup,
  AccordionPanel,
  Accordion,
  AccordionHeader,
  AccordionProps,
} from "@salt-ds/core";
import { ComponentMeta, Story } from "@storybook/react";
import "./accordion.stories.css";

export default {
  title: "Core/Accordion",
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

export const Default: Story<AccordionProps> = (props) => (
  <div className="story-root">
    <Accordion {...props}>
      <AccordionHeader>Mountains and hills</AccordionHeader>
      <AccordionPanel>
        <MountainsAndHills />
      </AccordionPanel>
    </Accordion>
  </div>
);

Default.args = {
  value: "Mountains and hills",
};

export const DefaultGroup: Story<AccordionStoryProps> = (props) => (
  <div className="story-root">
    <AccordionGroup>
      {accordions.map((accordion) => {
        const Content = contentMap[accordion];
        return (
          <Accordion
            value={accordion}
            disabled={props.disabled}
            key={accordion}
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

export const ExclusiveGroup: Story<AccordionStoryProps> = (props) => {
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
              key={accordion}
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

export const Disabled: Story<AccordionStoryProps> = (props) => (
  <div className="story-root">
    <AccordionGroup>
      {accordions.map((accordion, index) => {
        const Content = contentMap[accordion];
        return (
          <Accordion
            value={accordion}
            disabled={index === 1 || props.disabled}
            key={accordion}
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
