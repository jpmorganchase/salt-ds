import figma from "@figma/code-connect";
import { Avatar } from "../src/avatar/Avatar";

// Icon - https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?m=auto&node-id=24377-78056
figma.connect(
  Avatar,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=24377-78056",
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
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=24377%3A78140",
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

// Image - https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?m=auto&node-id=5688-71628
figma.connect(
  Avatar,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=5688-71628",
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
