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
  Label,
} from "@salt-ds/core";

export const AdditionalLabels = (): ReactElement => (
  <FlexLayout style={{ width: "80%" }}>
    <Accordion value="accordion-additional-label-example">
      <AccordionHeader style={{ alignItems: "flex-start" }}>
        <StackLayout gap={0.5} style={{ width: "100%" }}>
          <SplitLayout
            style={{ alignItems: "baseline" }}
            startItem={
              <Text>
                <strong>Account transfers</strong>
              </Text>
            }
            endItem={<Label color="secondary">2 out of 5 accounts</Label>}
          />
          <Label color="secondary">Easily manage payment and invoice</Label>
        </StackLayout>
      </AccordionHeader>
      <AccordionPanel>
        <FlowLayout>
          <Text>Please fill out the following details.</Text>
          <FormField labelPlacement="left">
            <FormLabel>Account Id</FormLabel>
            <Input />
          </FormField>
          <FormField labelPlacement="left">
            <FormLabel>Email</FormLabel>
            <Input />
          </FormField>
          <FormField labelPlacement="left">
            <FormLabel>Remarks</FormLabel>
            <Input />
          </FormField>
        </FlowLayout>
      </AccordionPanel>
    </Accordion>
  </FlexLayout>
);
