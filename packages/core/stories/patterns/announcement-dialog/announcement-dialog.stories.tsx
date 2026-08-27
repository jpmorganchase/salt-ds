import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  AnnouncementDialog,
  MultiAnnouncementDialog,
  FullImage,
  ContentScrolling,
  ResponsiveStackedContent,
  ResponsiveStackedButtonBar,
} from "../../../../../site/src/examples/patterns/announcement-dialog";

export {
  AnnouncementDialog,
  MultiAnnouncementDialog,
  FullImage,
  ContentScrolling,
  ResponsiveStackedContent,
  ResponsiveStackedButtonBar,
};

export default {
  title: "Patterns/Announcement Dialog",
} as Meta;

(ResponsiveStackedContent as typeof ResponsiveStackedContent & StoryMetadata)
  .globals = {
  viewport: { value: "mobile2" },
};

(ResponsiveStackedButtonBar as typeof ResponsiveStackedButtonBar & StoryMetadata)
  .globals = {
  viewport: { value: "mobile2" },
};
