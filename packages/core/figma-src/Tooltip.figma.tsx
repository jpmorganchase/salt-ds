import { Tooltip } from "../src/tooltip/Tooltip";

import figma from "@figma/code-connect";

// Tooltip status - Info
figma.connect(
  Tooltip,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25341%3A5243",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      content: figma.string("Body text value"),
      placement: figma.enum("Placement", {
        Bottom: "bottom",
        Top: "top",
        Left: "left",
        Right: "right",
      }),
      hideIcon: figma.boolean("Show icon", { true: false, false: true }),
    },
    example: (props) => (
      <Tooltip
        placement={props.placement}
        content={props.content}
        status="info"
        hideIcon={props.hideIcon}
      >
        Your Trigger Component
      </Tooltip>
    ),
  },
);
// Tooltip status - Success
figma.connect(
  Tooltip,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25349-12018",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      content: figma.string("Body text value"),
      placement: figma.enum("Placement", {
        Bottom: "bottom",
        Top: "top",
        Left: "left",
        Right: "right",
      }),
      hideIcon: figma.boolean("Show icon", { true: false, false: true }),
    },
    example: (props) => (
      <Tooltip
        placement={props.placement}
        content={props.content}
        status="success"
        hideIcon={props.hideIcon}
      >
        Your Trigger Component
      </Tooltip>
    ),
  },
);

// Warning - https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25349-12245&t=ah5WkRCF59YmebzE-4
figma.connect(
  Tooltip,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25349-12245",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      content: figma.string("Body text value"),
      placement: figma.enum("Placement", {
        Bottom: "bottom",
        Top: "top",
        Left: "left",
        Right: "right",
      }),
      hideIcon: figma.boolean("Show icon", { true: false, false: true }),
    },
    example: (props) => (
      <Tooltip
        placement={props.placement}
        content={props.content}
        status="warning"
        hideIcon={props.hideIcon}
      >
        Your Trigger Component
      </Tooltip>
    ),
  },
);

// Error  - https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25353-12452&t=ah5WkRCF59YmebzE-4
figma.connect(
  Tooltip,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25353-12452",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      content: figma.string("Body text value"),
      placement: figma.enum("Placement", {
        Bottom: "bottom",
        Top: "top",
        Left: "left",
        Right: "right",
      }),
      hideIcon: figma.boolean("Show icon", { true: false, false: true }),
    },
    example: (props) => (
      <Tooltip
        placement={props.placement}
        content={props.content}
        status="error"
        hideIcon={props.hideIcon}
      >
        Your Trigger Component
      </Tooltip>
    ),
  },
);

// Default - https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25358-12659&t=ah5WkRCF59YmebzE-4
figma.connect(
  Tooltip,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=25358-12659",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      content: figma.string("Body text value"),
      placement: figma.enum("Placement", {
        Bottom: "bottom",
        Top: "top",
        Left: "left",
        Right: "right",
      }),
    },
    example: (props) => (
      <Tooltip placement={props.placement} content={props.content}>
        Your Trigger Component
      </Tooltip>
    ),
  },
);
