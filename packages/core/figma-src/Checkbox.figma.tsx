import figma from "@figma/code-connect";
import { Checkbox } from "../src/checkbox/";

// Default: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7952-81263&m=dev
figma.connect(
  Checkbox,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7952-81263",
  {
    props: {
      label: figma.boolean("Show value", {
        true: figma.string("Value text"),
        false: undefined,
      }),
    },
    example: (props) => <Checkbox label={props.label} value={props.label} />,
  },
);

// Error: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7954-77795&m=dev
figma.connect(
  Checkbox,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7954-77795",
  {
    props: {
      label: figma.boolean("Show value", {
        true: figma.string("Value text"),
        false: undefined,
      }),
    },
    example: (props) => (
      <Checkbox
        validationStatus="error"
        label={props.label}
        value={props.label}
      />
    ),
  },
);

// Warning: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7954-77981&m=dev
figma.connect(
  Checkbox,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7954-77981",
  {
    props: {
      label: figma.boolean("Show value", {
        true: figma.string("Value text"),
        false: undefined,
      }),
    },
    example: (props) => (
      <Checkbox
        validationStatus="warning"
        label={props.label}
        value={props.label}
      />
    ),
  },
);
