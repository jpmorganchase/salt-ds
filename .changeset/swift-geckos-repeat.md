---
"@salt-ds/core": minor
---

Add AccordionGroup, AccordionPanel, Accordion, AccordionHeader.

A pane containing summary content, which can then be expanded or collapsed to allow the user to show or hide content.

```tsx
<AccordionGroup>
  <Accordion
    expanded={expanded === "accordion-0"}
    value="accordion-0"
    onToggle={onChange}
  >
    <AccordionHeader>AccordionHeader0</AccordionHeader>
    <AccordionPanel>AccordionPanel0</AccordionPanel>
  </Accordion>
  <Accordion
    expanded={expanded === "accordion-1"}
    value="accordion-1"
    onToggle={onChange}
  >
    <AccordionHeader>AccordionHeader1</AccordionHeader>
    <AccordionPanel>AccordionPanel1</AccordionPanel>
  </Accordion>
</AccordionGroup>
```
