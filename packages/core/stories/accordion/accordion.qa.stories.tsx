import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  FlowLayout,
  FormField,
  FormFieldLabel as FormLabel,
  Input,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Accordion/QA",
  component: Accordion,
} as Meta<typeof Accordion>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <AccordionGroup>
      <Accordion value="default">
        <AccordionHeader>Accordion label</AccordionHeader>
        <AccordionPanel>
          <FlowLayout>
            This is content inside of an Accordion.
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
      <Accordion value="disabled" disabled>
        <AccordionHeader>Accordion label</AccordionHeader>
        <AccordionPanel>
          <FlowLayout>
            This is content inside of an Accordion.
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
      <Accordion value="error" status="error">
        <AccordionHeader>Accordion label</AccordionHeader>
        <AccordionPanel>
          <FlowLayout>
            This is content inside of an Accordion.
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
      <Accordion value="warning" status="warning">
        <AccordionHeader>Accordion label</AccordionHeader>
        <AccordionPanel>
          <FlowLayout>
            This is content inside of an Accordion.
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
      <Accordion value="success" status="success">
        <AccordionHeader>Accordion label</AccordionHeader>
        <AccordionPanel>
          <FlowLayout>
            This is content inside of an Accordion.
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
    </AccordionGroup>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
