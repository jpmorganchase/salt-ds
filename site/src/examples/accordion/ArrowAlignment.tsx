import { ReactElement } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";

export const ArrowAlignment = (): ReactElement => {
  return (
    <div style={{ width: "80%", height: "100%" }}>
      <Accordion value="accordion-example" arrowAlignment="right">
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
    </div>
  );
};
