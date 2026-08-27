import type { Meta } from "@storybook/react-vite";
import type { StoryMetadata } from "../storyMetadata";
import {
  Column,
  Row,
} from "../../../../../site/src/examples/patterns/international-phone-number-input";

export {
  Column,
  Row,
};

export default {
  title: "Patterns/International Phone Number",
} as Meta;

(Column as typeof Column & StoryMetadata).args = {
  direction: "column",
};

(Row as typeof Row & StoryMetadata).args = {
  direction: "row",
};
