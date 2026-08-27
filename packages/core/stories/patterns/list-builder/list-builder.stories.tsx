import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  SingleSelect,
  Multiselect,
  Vertical,
} from "../../../../../site/src/examples/patterns/list-builder";

export {
  SingleSelect,
  Multiselect,
  Vertical,
};

export default {
  title: "Patterns/List builder",
} as Meta;

(Multiselect as typeof Multiselect & StoryMetadata).args = {
  multiselect: true,
};

(Vertical as typeof Vertical & StoryMetadata).args = { orientation: "column" };

(Vertical as typeof Vertical & StoryMetadata).parameters = {
  layout: "padded",
};
