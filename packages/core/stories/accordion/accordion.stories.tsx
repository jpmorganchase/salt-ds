import { useState, SyntheticEvent, ChangeEvent } from "react";
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
  StackLayout,
  Text,
  SplitLayout,
  FormFieldLabel,
  CheckboxGroup,
  Checkbox,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import "./accordion.stories.css";

export default {
  title: "Core/Accordion",
  component: Accordion,
  // Default is centered, but accordion will jump around when interacting
  parameters: {
    layout: "padded",
  },
} as Meta<typeof Accordion>;

export const Default: StoryFn<AccordionProps> = (props) => (
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
);

Default.args = {
  value: "accordion-1",
};

export const DefaultGroup: StoryFn<AccordionGroupProps> = (props) => (
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
);

export const ExclusiveGroup: StoryFn<AccordionGroupProps> = (props) => {
  const [expanded, setExpanded] = useState<string>("");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    setExpanded((old) => (old === value ? "" : value));
  };

  return (
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
  );
};

export const Disabled: StoryFn<AccordionGroupProps> = (props) => (
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
);

const statuses: AccordionProps["status"][] = [
  undefined,
  "error",
  "warning",
  "success",
];

export const Status: StoryFn<AccordionGroupProps> = (props) => (
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
);

const accounts = [
  { name: "Account 1", number: "8736" },
  { name: "Account 2", number: "2564" },
];

const features = [
  {
    name: "Domestic wires",
    id: "domestic_wires",
    description: "Initiate wire transfers to another bank",
  },
  {
    name: "Account transfers",
    id: "account_transfers",
    description: "Move money within your accounts",
  },
];

export const AdditionalLabels: StoryFn = () => {
  const [state, setState] = useState<Record<string, string[]>>({
    domestic_wires: [],
    account_transfers: [],
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name;

    setState((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((account) => account !== value)
        : [...prev[name], value],
    }));
  };

  return (
    <div style={{ width: "80%", height: "100%" }}>
      <AccordionGroup>
        {Object.values(features).map(({ name, description, id }) => (
          <Accordion value={id} key={name}>
            <AccordionHeader>
              <StackLayout gap={0.5}>
                <SplitLayout
                  align="baseline"
                  startItem={
                    <Text>
                      <strong>{name}</strong>
                    </Text>
                  }
                  endItem={
                    <Text styleAs="label" color="secondary">
                      {state[id].length} of {accounts.length} accounts
                    </Text>
                  }
                />
                <Text styleAs="label" color="secondary">
                  {description}
                </Text>
              </StackLayout>
            </AccordionHeader>
            <AccordionPanel>
              <FormField>
                <FormFieldLabel>Accounts for this service</FormFieldLabel>
                <CheckboxGroup
                  checkedValues={state[id]}
                  onChange={handleChange}
                  direction="horizontal"
                >
                  {accounts.map(({ name, number }) => (
                    <Checkbox
                      label={`${name} (...${number})`}
                      name={id}
                      value={number}
                      key={name}
                    />
                  ))}
                </CheckboxGroup>
              </FormField>
            </AccordionPanel>
          </Accordion>
        ))}
      </AccordionGroup>
    </div>
  );
};
