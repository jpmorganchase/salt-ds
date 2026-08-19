import { Link, Text } from "@salt-ds/core";
import { type IconProps, TearOutIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ComponentProps } from "react";

export default {
  title: "Core/Link",
  component: Link,
} as Meta<typeof Link>;

const LinkTemplate: StoryFn<typeof Link> = (args) => <Link {...args} />;

const CustomTearOutIcon = (props: IconProps) => (
  <TearOutIcon {...props} data-testid="CustomTearOutIcon" />
);

export const Primary = LinkTemplate.bind({});
Primary.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
};

export const Secondary = LinkTemplate.bind({});
Secondary.args = {
  color: "secondary",
  href: "https://github.com/salt-ds/core",
  children: "View source",
};

export const Accent = LinkTemplate.bind({});
Accent.args = {
  color: "accent",
  href: "https://github.com/salt-ds/core",
  children: "View source",
};

export const InheritColor: StoryFn<typeof Link> = (args) => {
  return (
    <Text color="error">
      <Link
        href="/salt/components/form-field/accessibility"
        color="inherit"
        {...args}
      >
        Review validation guidance
      </Link>
    </Text>
  );
};

export const TargetBlank = LinkTemplate.bind({});
TargetBlank.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
  target: "_blank",
  rel: "noopener",
};

export const TargetBlankCustomIcon = LinkTemplate.bind({});
TargetBlankCustomIcon.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
  target: "_blank",
  rel: "noopener",
  IconComponent: CustomTearOutIcon,
};

export const Strong = LinkTemplate.bind({});
Strong.args = {
  href: "https://github.com/salt-ds/core",
  children: (
    <span>
      View <strong>source</strong>
    </span>
  ),
};

export const Small = LinkTemplate.bind({});
Small.args = {
  href: "https://github.com/salt-ds/core",
  children: (
    <span>
      View <small>source</small>
    </span>
  ),
};

export const StyleAs = LinkTemplate.bind({});
StyleAs.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
  styleAs: "label",
};

export const Truncation: StoryFn<typeof Link> = (args) => {
  return (
    <div style={{ width: 150 }}>
      <Link href="https://github.com/salt-ds/core" maxRows={1} {...args}>
        View Salt Core package source
      </Link>
    </div>
  );
};

const CustomLinkImplementation = ({
  children,
  ...props
}: ComponentProps<"a">) => <a {...props}>{children}</a>;

export const RenderElement = LinkTemplate.bind({});
RenderElement.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
  render: <CustomLinkImplementation />,
};

export const RenderProp = LinkTemplate.bind({});
RenderProp.args = {
  href: "https://github.com/salt-ds/core",
  children: "View source",
  render: (props) => <CustomLinkImplementation {...props} />,
};
