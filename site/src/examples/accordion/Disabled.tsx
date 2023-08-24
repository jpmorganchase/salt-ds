import { ReactElement } from "react";
import { AccordionGroup, Accordion, AccordionHeader, AccordionPanel, FlowLayout, FormField, FormFieldLabel as FormLabel, Input } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
    <AccordionGroup>
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