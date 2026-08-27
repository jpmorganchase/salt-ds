import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  Navigation,
} from "../../../../../site/src/examples/patterns/navigation";

export {
  Navigation,
};

export default {
  title: "Patterns/Navigation",
} as Meta;

(Navigation as typeof Navigation & StoryMetadata).parameters = {
  layout: "fullscreen",
};
