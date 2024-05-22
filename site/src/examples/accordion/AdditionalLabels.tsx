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
  SplitLayout,
} from "@salt-ds/core";

export const AdditionalLabels = (): ReactElement => (
  <FlexLayout style={{ width: "80%" }}>
    <Accordion value="accordion-additional-label-example">
      <AccordionHeader>
        <SplitLayout
          startItem={
            <StackLayout gap={0.5} align="start">
              <Text>Title</Text>
              <Text color="secondary">Description goes here </Text>
            </StackLayout>
          }
          endItem={<Text color="secondary">Secondary label</Text>}
        />
      </AccordionHeader>
      <AccordionPanel>
        <FlowLayout>
          <Text> Please fill out the following details.</Text>
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
