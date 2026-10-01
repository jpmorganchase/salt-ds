import type { Meta } from "@storybook/react-vite";
import {
  Column,
  Row,
} from "../../../../../site/src/examples/patterns/international-phone-number-input";
import type { StoryMetadata } from "../storyMetadata";

export { Column, Row };

export default {
  title: "Patterns/International Phone Number",
} as Meta;

(Column as typeof Column & StoryMetadata).args = {
  direction: "column",
};

(Row as typeof Row & StoryMetadata).args = {
  direction: "row",
};
