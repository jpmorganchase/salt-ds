import { ReactElement, SyntheticEvent, useState } from "react";
import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";

export const ExclusiveGroup = (): ReactElement => {
  const [expanded, setExpanded] = useState<string>("");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    setExpanded((old) => (old === value ? "" : value));
  };

  return (
    <div style={{ width: "80%", height: "100%" }}>
      <AccordionGroup>
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
                  <FormFieldLabel>Disclosure ID</FormFieldLabel>
                  <Input />
                </FormField>
                <FormField labelPlacement="left">
                  <FormFieldLabel>Email</FormFieldLabel>
                  <Input />
                </FormField>
                <FormField labelPlacement="left">
                  <FormFieldLabel>Justification</FormFieldLabel>
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
