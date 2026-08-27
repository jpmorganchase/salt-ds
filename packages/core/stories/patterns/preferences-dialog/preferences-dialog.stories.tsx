import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  PreferencesDialog,
  CollapsedPreferencesDialog,
} from "../../../../../site/src/examples/patterns/preferences-dialog";

export {
  PreferencesDialog,
  CollapsedPreferencesDialog,
};

export default {
  title: "Patterns/Preferences Dialog",
} as Meta;

(CollapsedPreferencesDialog as typeof CollapsedPreferencesDialog & StoryMetadata)
  .globals = {
  viewport: { value: "sm" },
};
