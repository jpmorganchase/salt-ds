# Card (Copilot Context)

Container for grouping related content. Three variants: `Card` (static), `InteractableCard` (selectable), `LinkCard` (navigation).

- API: ./card.json
- Guidance: ./card.md

## Key rules
- Use `Card` for static content, `InteractableCard` for selection, `LinkCard` for navigation
- Don't wrap a Card in a Button — use InteractableCard
- Don't nest interactive elements inside InteractableCard
- Use StackLayout inside cards for consistent internal spacing

## Example
```tsx
import { Card, InteractableCard, InteractableCardGroup, LinkCard } from "@salt-ds/core";

<Card>
  <StackLayout gap={1}>
    <Text styleAs="h3">Title</Text>
    <Text>Card content here.</Text>
  </StackLayout>
</Card>
```
