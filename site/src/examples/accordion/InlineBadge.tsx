import { ReactElement } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  Badge,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel as FormLabel,
  Input,
  SplitLayout,
} from "@salt-ds/core";

export const InlineBadge = (): ReactElement => (
  <FlexLayout style={{ width: "80%", height: "100%" }}>
    <Accordion value="accordion-example">
      <AccordionHeader>
        <SplitLayout
          align="baseline"
          startItem="Internal form"
          endItem={<Badge value={"NEW"} />}
        />
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
