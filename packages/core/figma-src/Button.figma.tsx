import figma from "@figma/code-connect";
import { Button } from "../src/button/Button";

// Neutral - 5594:10494
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=5594%3A10494",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="neutral"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=5594%3A10494",
  {
    variant: {
      State: "Loading",
    },
    props: {
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        loading
        loadingAnnouncement="ADD YOUR LOADING ANNOUNCEMENT HERE"
        sentiment="neutral"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);

// Accented - 5594:10364
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=5594%3A10364",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="accented"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=5594%3A10364",
  {
    variant: {
      State: "Loading",
    },
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        loading
        loadingAnnouncement="ADD YOUR LOADING ANNOUNCEMENT HERE"
        sentiment="accented"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);

// Caution - 32192:104949
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32192%3A104949",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="caution"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32192%3A104949",
  {
    variant: {
      State: "Loading",
    },
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        loading
        loadingAnnouncement="ADD YOUR LOADING ANNOUNCEMENT HERE"
        sentiment="caution"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
// Positive - 32189:104771
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32189%3A104771",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="positive"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32189%3A104771",
  {
    variant: {
      State: "Loading",
    },
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        loading
        loadingAnnouncement="ADD YOUR LOADING ANNOUNCEMENT HERE"
        sentiment="positive"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);

// Negative - 32148:16178
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32148%3A16178",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="negative"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
figma.connect(
  Button,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=32148%3A16178",
  {
    variant: {
      State: "Loading",
    },
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label", {
        true: figma.string("Label text value"),
        false: undefined,
      }),
      // labelTextValue: figma.string("Label text value"),,
      rightIcon: figma.boolean("Right icon", {
        true: figma.instance("Right icon type"),
        false: undefined,
      }),
      // rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon", {
        true: figma.instance("Left icon type"),
        false: undefined,
      }),
      // leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        loading
        loadingAnnouncement="ADD YOUR LOADING ANNOUNCEMENT HERE"
        sentiment="negative"
        appearance={props.appearance}
      >
        {props.leftIcon}
        {props.label}
        {props.rightIcon}
      </Button>
    ),
  },
);
