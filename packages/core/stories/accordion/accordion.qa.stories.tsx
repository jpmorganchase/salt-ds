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
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Accordion/Accordion QA",
  component: Accordion,
} as Meta<typeof Accordion>;

const UI = () => (
  <AccordionGroup>
    <Accordion value="default">
      <AccordionHeader>Default accordion</AccordionHeader>
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
      <AccordionHeader>Disabled accordion</AccordionHeader>
      <AccordionPanel />
    </Accordion>
    <Accordion value="error" status="error">
      <AccordionHeader>Error accordion</AccordionHeader>
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
      <AccordionHeader>Warning accordion</AccordionHeader>
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
      <AccordionHeader>Success accordion</AccordionHeader>
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
    <Accordion value="success" status="success" disabled>
      <AccordionHeader>Disabled success accordion</AccordionHeader>
      <AccordionPanel />
    </Accordion>
    <Accordion value="default" expanded>
      <AccordionHeader>Left align indicator</AccordionHeader>
      <AccordionPanel>
        <FlowLayout>
          This is content inside of an Accordion.
          <FormField labelPlacement="left">
            <FormLabel>Disclosure ID</FormLabel>
            <Input />
          </FormField>
        </FlowLayout>
      </AccordionPanel>
    </Accordion>
    <Accordion value="default" indicatorSide="right" expanded>
      <AccordionHeader>Right align indicator</AccordionHeader>
      <AccordionPanel>
        <FlowLayout>
          This is content inside of an Accordion.
          <FormField labelPlacement="left">
            <FormLabel>Disclosure ID</FormLabel>
            <Input />
          </FormField>
        </FlowLayout>
      </AccordionPanel>
    </Accordion>
  </AccordionGroup>
);

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <UI />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
