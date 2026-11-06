import type { Meta } from "@storybook/react-vite";
import {
  NestedGroup,
  SecondaryNavigation,
  SingleLevel,
} from "../../../../../site/src/examples/patterns/vertical-navigation";
import type { StoryMetadata } from "../storyMetadata";

export { NestedGroup, SecondaryNavigation, SingleLevel };

export default {
  title: "Patterns/Vertical Navigation",
} as Meta;

(SingleLevel as typeof SingleLevel & StoryMetadata).parameters = {
  layout: "fullscreen",
};

(NestedGroup as typeof NestedGroup & StoryMetadata).parameters = {
  layout: "fullscreen",
};

(SecondaryNavigation as typeof SecondaryNavigation & StoryMetadata).parameters =
  {
    layout: "fullscreen",
  };
