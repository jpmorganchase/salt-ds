import type { Meta } from "@storybook/react-vite";
import {
  AnnouncementDialog,
  ContentScrolling,
  FullImage,
  MultiAnnouncementDialog,
  ResponsiveStackedButtonBar,
  ResponsiveStackedContent,
} from "../../../../../site/src/examples/patterns/announcement-dialog";
import type { StoryMetadata } from "../storyMetadata";

export {
  AnnouncementDialog,
  ContentScrolling,
  FullImage,
  MultiAnnouncementDialog,
  ResponsiveStackedButtonBar,
  ResponsiveStackedContent,
};

export default {
  title: "Patterns/Announcement Dialog",
} as Meta;

(
  ResponsiveStackedContent as typeof ResponsiveStackedContent & StoryMetadata
).globals = {
  viewport: { value: "mobile2" },
};

(
  ResponsiveStackedButtonBar as typeof ResponsiveStackedButtonBar &
    StoryMetadata
).globals = {
  viewport: { value: "mobile2" },
};
