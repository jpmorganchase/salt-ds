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
  StackLayout,
  Text,
} from "@salt-ds/core";

export const AdditionalLabels = (): ReactElement => (
  <FlexLayout style={{ width: "90%" }}>
    <Accordion value="accordion-additional-label-example">
      <AccordionHeader>
        <StackLayout direction={"row"} style={{ width: "100%" }}>
          <StackLayout gap={0.5} align="start">
            <Text>Title</Text>
            <Text color="secondary">Description goes here</Text>
          </StackLayout>
          <div style={{ marginLeft: "auto" }}>
            <Text color="secondary" style={{ width: "max-content" }}>
              Secondary label{" "}
            </Text>
          </div>
        </StackLayout>
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
