import { ReactElement } from "react";
import { Accordion, AccordionHeader, AccordionPanel, FlowLayout, FormField, FormFieldLabel as FormLabel, Input } from "@salt-ds/core";

export const Default = (): ReactElement => (
    <Accordion value="accordion-example">
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
);