# Accordion (Copilot Context)

Organize related content in expandable/collapsible sections. Use when reducing scrolling or space is essential.

- API: ./accordion.json
- Guidance: ./accordion.md

## Key rules
- Use `AccordionHeader` and `AccordionPanel` within each `Accordion`; use `AccordionGroup` when grouping multiple accordions
- Header labels must be clear and describe the content they hide
- Use `indicatorSide="right"` for mobile or when drag handles are on the left
- Use `status` prop for error/warning/success states (not custom styling)
- Make accordions keyboard accessible (Tab, Enter/Space navigable)
- The `value` prop is optional; use it only when implementing controlled behavior

## Example

```tsx
import { Accordion, AccordionGroup, AccordionHeader, AccordionPanel } from "@salt-ds/core";
import { useState } from "react";

// Uncontrolled (multiple can be open)
<AccordionGroup>
  <Accordion>
    <AccordionHeader>Account Settings</AccordionHeader>
    <AccordionPanel>Settings content here</AccordionPanel>
  </Accordion>
  <Accordion>
    <AccordionHeader>Privacy</AccordionHeader>
    <AccordionPanel>Privacy content here</AccordionPanel>
  </Accordion>
</AccordionGroup>

// Controlled (one open at a time)
const [expandedKey, setExpandedKey] = useState<string | null>("section1");

<AccordionGroup>
  <Accordion value="section1" expanded={expandedKey === "section1"} onToggle={() => setExpandedKey(expandedKey === "section1" ? null : "section1") }>
    <AccordionHeader>Section 1</AccordionHeader>
    <AccordionPanel>Content 1</AccordionPanel>
  </Accordion>
  <Accordion value="section2" expanded={expandedKey === "section2"} onToggle={() => setExpandedKey(expandedKey === "section2" ? null : "section2") }>
    <AccordionHeader>Section 2</AccordionHeader>
    <AccordionPanel>Content 2</AccordionPanel>
  </Accordion>
</AccordionGroup>
```
