import figma from "@figma/code-connect";
import { Drawer, DrawerCloseButton } from "../src/drawer/";

// Primary drawer: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=10110-504&m=dev
figma.connect(
  Drawer,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=10110-504",
  {
    variant: { "Close button": true },

    props: {
      content: figma.children("*"),
    },
    example: (props) => (
      <Drawer>
        <DrawerCloseButton
          onClick={() => {
            /** close */
          }}
        />
        {props.content}
      </Drawer>
    ),
  },
);
figma.connect(
  Drawer,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=10110-504",
  {
    variant: { "Close button": false },

    props: {
      content: figma.children("*"),
    },
    example: (props) => <Drawer>{props.content}</Drawer>,
  },
);

// Secondary drawer: https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=10187-367
figma.connect(
  Drawer,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=10187-367",
  {
    variant: { "Close button": true },

    props: {
      content: figma.children("*"),
    },
    example: (props) => (
      <Drawer variant="secondary">
        <DrawerCloseButton
          onClick={() => {
            /** close */
          }}
        />
        {props.content}
      </Drawer>
    ),
  },
);
figma.connect(
  Drawer,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=10187-367",
  {
    variant: { "Close button": false },

    props: {
      content: figma.children("*"),
    },
    example: (props) => <Drawer variant="secondary">{props.content}</Drawer>,
  },
);
