import type { Meta } from "@storybook/react-vite";
import {
  Horizontal,
  HorizontalWithCancelConfirmation,
  Modal,
  ModalWithConfirmations,
  VerticalWithCancelConfirmation,
} from "../../../../../site/src/examples/patterns/wizard";

export {
  Horizontal,
  HorizontalWithCancelConfirmation,
  Modal,
  ModalWithConfirmations,
  VerticalWithCancelConfirmation,
};

export default {
  title: "Patterns/Wizard",
  parameters: {
    layout: "padded",
  },
} as Meta;
