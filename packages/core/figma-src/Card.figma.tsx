import figma from "@figma/code-connect";
import { InteractableCard } from "../src/interactable-card/";

// Tertiary Interactable Card/Accent Left
figma.connect(
  InteractableCard,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=44325%3A4200",
  {
    props: {
      // customContent: figma.boolean("Custom content"),
      // contentArea: figma.boolean("Content area"),
      state: figma.enum("State", {
        Disabled: true,
      }),
      content: figma.children("*"),
    },
    example: (props) => (
      <InteractableCard variant="tertiary" disabled={props.state} accent="left">
        {props.content}
      </InteractableCard>
    ),
  },
);
