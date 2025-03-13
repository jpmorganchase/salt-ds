import figma from "@figma/code-connect";
import { Card } from "../src/card/";
import { InteractableCard } from "../src/interactable-card/";

// Primary Card: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15936-596
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15936-596",
  {
    props: {
      // customContent: figma.boolean("Custom content"),
      // contentArea: figma.boolean("Content area"),
      // state: figma.enum("State", {
      //   Disabled: true,
      // }),
      content: figma.children("*"),
    },
    example: (props) => <Card>{props.content}</Card>,
  },
);

// Primary accent card - top: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15936-993
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15936-993",
  {
    props: {
      content: figma.children("*"),
    },
    example: (props) => <Card accent="top">{props.content}</Card>,
  },
);

// Primary accent card - bottom: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15936-6223
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15936-6223",
  {
    props: {
      content: figma.children("*"),
    },
    example: (props) => <Card accent="bottom">{props.content}</Card>,
  },
);

// Primary accent card - right: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15936-6311
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15936-6311",
  {
    props: {
      content: figma.children("*"),
    },
    example: (props) => <Card accent="right">{props.content}</Card>,
  },
);

// Primary accent card - left: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15936-6264
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15936-6264",
  {
    props: {
      content: figma.children("*"),
    },
    example: (props) => <Card accent="left">{props.content}</Card>,
  },
);

// Secondary Card: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=15959-777
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=15959-777",
  {
    props: {
      // customContent: figma.boolean("Custom content"),
      // contentArea: figma.boolean("Content area"),
      // state: figma.enum("State", {
      //   Disabled: true,
      // }),
      content: figma.children("*"),
    },
    example: (props) => <Card variant="secondary">{props.content}</Card>,
  },
);

// Tertiary Card: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=44343-2759
figma.connect(
  Card,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=44343-2759",
  {
    props: {
      // customContent: figma.boolean("Custom content"),
      // contentArea: figma.boolean("Content area"),
      // state: figma.enum("State", {
      //   Disabled: true,
      // }),
      content: figma.children("*"),
    },
    example: (props) => <Card variant="tertiary">{props.content}</Card>,
  },
);

// Tertiary Interactable Card/Accent Left
figma.connect(
  InteractableCard,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=44325%3A4200",
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
