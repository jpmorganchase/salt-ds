import type { Meta } from "@storybook/react-vite";
import {
  Horizontal,
  HorizontalWithCancelConfirmation,
  VerticalWithCancelConfirmation,
  Modal,
  ModalWithConfirmations,
} from "../../../../../site/src/examples/patterns/wizard";

export {
  Horizontal,
  HorizontalWithCancelConfirmation,
  VerticalWithCancelConfirmation,
  Modal,
  ModalWithConfirmations,
};

export default {
  title: "Patterns/Wizard",
  parameters: {
    layout: "padded",
  },
} as Meta;
