import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  Button,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import { CollapseAllIcon, ExpandAllIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const accordions = Array.from({ length: 3 }, (_, i) => i + 1);
  const [expanded, setExpanded] = useState<number[]>([]);

  const handleAccordionToggle = (value: number) => {
    setExpanded((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleExpandAll = () => {
    setExpanded(accordions);
  };

  const handleCollapseAll = () => {
    setExpanded([]);
  };

  return (
    <FlexLayout
      style={{ width: "80%", height: "100%", flexDirection: "column" }}
    >
      <FlexLayout>
        <Button onClick={handleExpandAll}>
          <ExpandAllIcon /> Expand All
        </Button>
        <Button onClick={handleCollapseAll}>
          <CollapseAllIcon /> Collapse All
        </Button>
      </FlexLayout>

      <AccordionGroup>
        {accordions.map((i) => (
          <Accordion
            key={`accordion-${i}`}
            value={`accordion-${i}`}
            expanded={expanded.includes(i)}
            onToggle={() => handleAccordionToggle(i)}
          >
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
    </FlexLayout>
  );
};
