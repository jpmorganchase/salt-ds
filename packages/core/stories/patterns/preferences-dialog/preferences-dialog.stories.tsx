import type { Meta } from "@storybook/react-vite";
import {
  CollapsedPreferencesDialog,
  PreferencesDialog,
} from "../../../../../site/src/examples/patterns/preferences-dialog";
import type { StoryMetadata } from "../storyMetadata";

export { CollapsedPreferencesDialog, PreferencesDialog };

export default {
  title: "Patterns/Preferences Dialog",
} as Meta;

(
  CollapsedPreferencesDialog as typeof CollapsedPreferencesDialog &
    StoryMetadata
).globals = {
  viewport: { value: "sm" },
};
