import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  SingleLevel,
  NestedGroup,
  SecondaryNavigation,
} from "../../../../../site/src/examples/patterns/vertical-navigation";

export {
  SingleLevel,
  NestedGroup,
  SecondaryNavigation,
};

export default {
  title: "Patterns/Vertical Navigation",
} as Meta;

(SingleLevel as typeof SingleLevel & StoryMetadata).parameters = {
  layout: "fullscreen",
};

(NestedGroup as typeof NestedGroup & StoryMetadata).parameters = {
  layout: "fullscreen",
};

(SecondaryNavigation as typeof SecondaryNavigation & StoryMetadata).parameters = {
  layout: "fullscreen",
};
