import { ReactElement } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel as FormLabel,
  Input,
} from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";

export const InlineBadge = (): ReactElement => (
  <FlexLayout style={{ width: "80%" }}>
    <Accordion
      value="accordion-example"
      style={{ alignSelf: "self-start", display: "flex", width: "100%" }}
    >
      <AccordionHeader>
        <div style={{ justifyContent: "space-between" }}>
          Internal form
          <Badge value={"NEW"} />
        </div>
      </AccordionHeader>
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
  </FlexLayout>
);
