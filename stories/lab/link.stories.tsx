import { Link } from "@brandname/lab";

import "./link.stories.css";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Link",
  component: Link,
} as ComponentMeta<typeof Link>;

export const Default: ComponentStory<typeof Link> = () => {
  return <Link href="https://www.google.com">Link to URL</Link>;
};

export const Disabled: ComponentStory<typeof Link> = () => {
  return (
    <Link href="https://www.google.com" disabled>
      Link to URL
    </Link>
  );
};

export const TargetBlank: ComponentStory<typeof Link> = () => {
  return (
    <Link href="https://www.google.com" target="_blank">
      Link to URL
    </Link>
  );
};

export const TargetBlankDisabled: ComponentStory<typeof Link> = () => {
  return (
    <Link href="https://www.google.com" target="_blank" disabled>
      Link to URL
    </Link>
  );
};

export const TargetBlankNoIcon: ComponentStory<typeof Link> = () => {
  return (
    <Link
      className="uitkTargetBlankNoIcon-Link"
      href="https://www.google.com"
      target="_blank"
    >
      Link to URL
    </Link>
  );
};
