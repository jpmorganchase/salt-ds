import { ReactElement } from "react";
import { Accordion, AccordionGroup, AccordionHeader, AccordionPanel, FlowLayout, FormField, FormFieldLabel as FormLabel, Input } from "@salt-ds/core";

export const AccordionGroups = (): ReactElement => (
  <div style={{padding: "var(--salt-spacing-100)"}}>
  <AccordionGroup style={{alignSelf: "self-start"}}>
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