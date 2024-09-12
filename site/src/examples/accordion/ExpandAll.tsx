import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  Button,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { CollapseAllIcon, ExpandAllIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

const accordions = Array.from({ length: 3 }, (_, i) => i + 1);

export const ExpandAll = (): ReactElement => {
  const [expanded, setExpanded] = useState<number[]>([]);

  const handleAccordionToggle = (value: number) => {
    setExpanded((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : prev.concat(value),
    );
  };

  const handleExpandAll = () => {
    setExpanded(accordions);
  };

  const handleCollapseAll = () => {
    setExpanded([]);
  };

  return (
    <StackLayout
      gap={3}
      style={{ height: "100%", paddingInline: "var(--salt-spacing-300)" }}
    >
      <FlowLayout gap={1}>
        <Button onClick={handleExpandAll}>
          <ExpandAllIcon aria-hidden /> Expand All
        </Button>
        <Button onClick={handleCollapseAll}>
          <CollapseAllIcon aria-hidden /> Collapse All
        </Button>
      </FlowLayout>

      <AccordionGroup>
        {accordions.map((i) => (
          <Accordion
            key={`accordion-${i}`}
            value={`accordion-${i}`}
            expanded={expanded.includes(i)}
            onToggle={() => handleAccordionToggle(i)}
            indicatorSide="right"
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
    </StackLayout>
  );
};
