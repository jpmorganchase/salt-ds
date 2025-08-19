import { Link, Text } from "@salt-ds/core";
import { StackoverflowIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ComponentProps } from "react";

export default {
  title: "Core/Link",
  component: Link,
} as Meta<typeof Link>;

const LinkTemplate: StoryFn<typeof Link> = (args) => <Link {...args} />;

export const Primary = LinkTemplate.bind({});
Primary.args = {
  href: "https://github.com/salt-ds/core",
  children: "Link to URL",
};

export const Secondary = LinkTemplate.bind({});
Secondary.args = {
  color: "secondary",
  href: "https://github.com/salt-ds/core",
  children: "Link to URL",
};

export const Accent = LinkTemplate.bind({});
Accent.args = {
  color: "accent",
  href: "https://github.com/salt-ds/core",
  children: "Link to URL",
};

export const InheritColor: StoryFn<typeof Link> = (args) => {
  return (
    <Text color="error">
      You've encountered an error{" "}
      <Link href="https://github.com/salt-ds/core" color="inherit" {...args}>
        (#5417)
      </Link>
    </Text>
  );
};

export const TargetBlank = LinkTemplate.bind({});
TargetBlank.args = {
  href: "https://github.com/salt-ds/core",
  children: "Link to URL",
  target: "_blank",
};

export const TargetBlankCustomIcon = LinkTemplate.bind({});
TargetBlankCustomIcon.args = {
  href: "https://github.com/salt-ds/core",
  children: "Link to URL",
  target: "_blank",
  IconComponent: StackoverflowIcon,
};

export const Strong = LinkTemplate.bind({});
Strong.args = {
  href: "https://github.com/salt-ds/core",
  children: (
    <span>
      This is a <strong>strong</strong> link example
    </span>
  ),
};

export const Small = LinkTemplate.bind({});
Small.args = {
  href: "https://github.com/salt-ds/core",
  children: (
    <span>
      This is a <small>small</small> link example
    </span>
  ),
};

export const StyleAs = LinkTemplate.bind({});
StyleAs.args = {
  href: "https://github.com/salt-ds/core",
  children: "This is a styleAs label example",
  styleAs: "label",
};

export const TargetBlankNoIcon = LinkTemplate.bind({});
TargetBlankNoIcon.args = {
  href: "https://github.com/salt-ds/core",
  children: "This has no icon",
  target: "_blank",
  IconComponent: null,
};

export const Truncation: StoryFn<typeof Link> = (args) => {
  return (
    <div style={{ width: 150 }}>
      <Link href="#root" maxRows={1} {...args}>
        This is a truncation example
      </Link>
    </div>
  );
};

const CustomLinkImplementation = (props: ComponentProps<"a">) => (
  <a href="#root" aria-label={"overridden-label"} {...props}>
    Your own Link implementation
  </a>
);

export const RenderElement = LinkTemplate.bind({});
RenderElement.args = {
  href: "https://github.com/salt-ds/core",
  render: <CustomLinkImplementation />,
};

export const RenderProp = LinkTemplate.bind({});
RenderProp.args = {
  href: "https://github.com/salt-ds/core",
  render: (props) => <CustomLinkImplementation {...props} />,
};
