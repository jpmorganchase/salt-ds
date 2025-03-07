import figma from "@figma/code-connect";
import { Avatar } from "../src/avatar/Avatar";

// Icon variant - https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=24377-78056
figma.connect(
  Avatar,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=24377-78056",
  {
    props: {
      size: figma.enum("Size", {
        "1x": 1,
        "2x": 2,
        "3x": 3,
        "4x": 4,
      }),
    },
    example: (props) => <Avatar size={props.size} />,
  },
);

// Initials
figma.connect(
  Avatar,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=24377%3A78140",
  {
    props: {
      size: figma.enum("Size", {
        "1x": 1,
        "2x": 2,
        "3x": 3,
        "4x": 4,
      }),
      // initialsValue: figma.string("Initials value"), // initialsValue in code is generated automatically
    },
    example: (props) => <Avatar size={props.size} name="Foo Bar" />,
  },
);

// Image - https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=5688-71628
figma.connect(
  Avatar,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=5688-71628",
  {
    props: {
      size: figma.enum("Size", {
        "1x": 1,
        "2x": 2,
        "3x": 3,
        "4x": 4,
      }),
    },
    example: (props) => (
      <Avatar size={props.size} name="Foo Bar" src="/img/examples/avatar.png" />
    ),
  },
);
