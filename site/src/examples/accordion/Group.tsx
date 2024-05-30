import { ReactElement } from "react";
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

export const Group = (): ReactElement => (
  <div style={{ width: "80%", height: "100%" }}>
    <AccordionGroup>
      {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
        <Accordion value={`accordion-${i}`} key={`accordion-${i}`}>
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
