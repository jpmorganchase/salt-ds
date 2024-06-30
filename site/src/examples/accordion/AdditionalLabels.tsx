import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  FormField,
  FormFieldLabel,
  Label,
  SplitLayout,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

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

export const AdditionalLabels = (): ReactElement => {
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
          <Accordion value={id} key={id}>
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
                      key={number}
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
