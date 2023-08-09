import { useState, SyntheticEvent } from "react";
import {
  AccordionGroup,
  AccordionPanel,
  Accordion,
  AccordionHeader,
  AccordionProps,
  FlowLayout,
  FormField,
  FormFieldLabel as FormLabel,
  Input,
  AccordionGroupProps,
} from "@salt-ds/core";
import { ComponentMeta, Story } from "@storybook/react";
import "./accordion.stories.css";

export default {
  title: "Core/Accordion",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

export const Default: Story<AccordionProps> = (props) => (
  <div className="story-root">
    <Accordion {...props}>
      <AccordionHeader>Internal form</AccordionHeader>
      <AccordionPanel>
        <FlowLayout>
          Please fill out the following details.
          <FormField labelPlacement="left">
            <FormLabel>Disclosure ID</FormLabel>
            <Input />
          </FormField>
          <FormField labelPlacement="left">
            <FormLabel>Email</FormLabel>
            <Input />
          </FormField>
          <FormField labelPlacement="left">
            <FormLabel>Justification</FormLabel>
            <Input />
          </FormField>
        </FlowLayout>
      </AccordionPanel>
    </Accordion>
  </div>
);

Default.args = {
  value: "accordion-1",
};

export const DefaultGroup: Story<AccordionGroupProps> = (props) => (
  <div className="story-root">
    <AccordionGroup {...props}>
      {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
        <Accordion value={`accordion-${i}`} key={`accordion-${i}`}>
          <AccordionHeader>Internal form</AccordionHeader>
          <AccordionPanel>
            <FlowLayout>
              Please fill out the following details.
              <FormField labelPlacement="left">
                <FormLabel>Disclosure ID</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Email</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Justification</FormLabel>
                <Input />
              </FormField>
            </FlowLayout>
          </AccordionPanel>
        </Accordion>
      ))}
    </AccordionGroup>
  </div>
);

export const ExclusiveGroup: Story<AccordionGroupProps> = (props) => {
  const [expanded, setExpanded] = useState<string>("");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    setExpanded((old) => (old === value ? "" : value));
  };

  return (
    <div className="story-root">
      <AccordionGroup {...props}>
        {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
          <Accordion
            value={`accordion-${i}`}
            expanded={expanded === `accordion-${i}`}
            onToggle={onChange}
            key={`accordion-${i}`}
          >
            <AccordionHeader>Internal form</AccordionHeader>
            <AccordionPanel>
              <FlowLayout>
                Please fill out the following details.
                <FormField labelPlacement="left">
                  <FormLabel>Disclosure ID</FormLabel>
                  <Input />
                </FormField>
                <FormField labelPlacement="left">
                  <FormLabel>Email</FormLabel>
                  <Input />
                </FormField>
                <FormField labelPlacement="left">
                  <FormLabel>Justification</FormLabel>
                  <Input />
                </FormField>
              </FlowLayout>
            </AccordionPanel>
          </Accordion>
        ))}
      </AccordionGroup>
    </div>
  );
};

export const Disabled: Story<AccordionGroupProps> = (props) => (
  <div className="story-root">
    <AccordionGroup {...props}>
      {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
        <Accordion
          value={`accordion-${i}`}
          key={`accordion-${i}`}
          disabled={i === 2}
        >
          <AccordionHeader>Internal form</AccordionHeader>
          <AccordionPanel>
            <FlowLayout>
              Please fill out the following details.
              <FormField labelPlacement="left">
                <FormLabel>Disclosure ID</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Email</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Justification</FormLabel>
                <Input />
              </FormField>
            </FlowLayout>
          </AccordionPanel>
        </Accordion>
      ))}
    </AccordionGroup>
  </div>
);

const statuses: AccordionProps["status"][] = [
  undefined,
  "error",
  "warning",
  "success",
];

export const Status: Story<AccordionGroupProps> = (props) => (
  <div className="story-root">
    <AccordionGroup {...props}>
      {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
        <Accordion
          value={`accordion-${i}`}
          key={`accordion-${i}`}
          status={statuses[i]}
        >
          <AccordionHeader>Internal form</AccordionHeader>
          <AccordionPanel>
            <FlowLayout>
              Please fill out the following details.
              <FormField labelPlacement="left">
                <FormLabel>Disclosure ID</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Email</FormLabel>
                <Input />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel>Justification</FormLabel>
                <Input />
              </FormField>
            </FlowLayout>
          </AccordionPanel>
        </Accordion>
      ))}
    </AccordionGroup>
  </div>
);
