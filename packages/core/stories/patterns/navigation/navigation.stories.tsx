import type { Meta } from "@storybook/react-vite";
import { Navigation } from "../../../../../site/src/examples/patterns/navigation";
import type { StoryMetadata } from "../storyMetadata";

export { Navigation };

export default {
  title: "Patterns/Navigation",
} as Meta;

(Navigation as typeof Navigation & StoryMetadata).parameters = {
  layout: "fullscreen",
};
