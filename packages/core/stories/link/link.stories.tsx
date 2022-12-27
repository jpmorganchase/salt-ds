import { Link } from "@salt-ds/core";

import { Meta, StoryFn } from "@storybook/react";
import { StackoverflowIcon } from "@salt-ds/icons";

export default {
  title: "Core/Link",
  component: Link,
} as Meta<typeof Link>;

const LinkTemplate: StoryFn = (args) => <Link {...args} />;

export const Primary = LinkTemplate.bind({});
Primary.args = {
  href: "https://www.google.com",
  children: "Link to URL",
};

export const Secondary = LinkTemplate.bind({});
Secondary.args = {
  href: "https://www.google.com",
  children: "Link to URL",
  variant: "secondary",
};

export const TargetBlank = LinkTemplate.bind({});
TargetBlank.args = {
  href: "https://www.google.com",
  children: "Link to URL",
  target: "_blank",
};

export const TargetBlankCustomIcon = LinkTemplate.bind({});
TargetBlankCustomIcon.args = {
  href: "https://www.google.com",
  children: "Link to URL",
  target: "_blank",
  IconComponent: StackoverflowIcon,
};

export const Strong: StoryFn<typeof Link> = (args) => {
  return (
    <Link {...args}>
      This is a <strong>strong</strong> link example
    </Link>
  );
};
Strong.args = {
  href: "#root",
  target: "_blank",
};

export const Small: StoryFn<typeof Link> = (args) => {
  return (
    <Link {...args}>
      This is a <small>small</small> link example
    </Link>
  );
};
Small.args = {
  href: "#root",
  target: "_blank",
};

export const StyleAs = LinkTemplate.bind({});
StyleAs.args = {
  href: "#root",
  styleAs: "label",
};

export const Truncation: StoryFn<typeof Link> = (args) => {
  return (
    <div style={{ width: 150 }}>
      <Link {...args}>This is a truncation example</Link>
    </div>
  );
};
Truncation.args = {
  maxRows: 1,
};

// export const WithTooltip: StoryFn<typeof Link> = () => {
//   return (
//     <div style={{ width: 50 }}>
//       <Link
//         // truncate={true} maxRows={1}
//         href="https://www.google.com"
//       >
//         Link to URL with tooltip
//       </Link>
//     </div>
//   );
// };
