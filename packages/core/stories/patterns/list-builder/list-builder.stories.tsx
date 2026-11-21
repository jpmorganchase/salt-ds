import type { Meta } from "@storybook/react-vite";
import {
  Multiselect,
  SingleSelect,
  Vertical,
} from "../../../../../site/src/examples/patterns/list-builder";
import type { StoryMetadata } from "../storyMetadata";

export { Multiselect, SingleSelect, Vertical };

export default {
  title: "Patterns/List builder",
} as Meta;

(Vertical as typeof Vertical & StoryMetadata).parameters = {
  layout: "padded",
};
