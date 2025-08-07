import { Link, Text } from "@salt-ds/core";
import { UserIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Link/Link QA",
  component: Link,
} as Meta<typeof Link>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Link href="https://www.google.com">Link</Link>
    <Link href="https://www.google.com" target="_blank">
      Link target blank
    </Link>
    <div style={{ width: 150 }}>
      <Link href="https://www.google.com" maxRows={1}>
        <strong>Strong</strong> and <small>small</small> truncation example
      </Link>
    </div>
    <Link href="https://www.google.com" color="secondary">
      Secondary Link
    </Link>
    <Link href="https://www.google.com" color="accent">
      Accent Link
    </Link>
    <Text color="error">
      <Link href="https://www.google.com" color="inherit">
        Inherit Link
      </Link>
    </Text>
    <Link
      href="https://www.google.com"
      style={{ color: "var(--salt-content-foreground-visited)" }}
    >
      Forced visited
    </Link>
    <Link
      href="https://www.google.com"
      target="_blank"
      IconComponent={UserIcon}
    >
      Custom icon
    </Link>
    <Link href="https://www.google.com" target="_blank" IconComponent={null}>
      No icon
    </Link>
    <Link href="https://www.google.com" underline="never">
      Underline never
    </Link>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection height={500} width={1000} {...props}>
    <Link href="https://www.google.com">Link</Link>
    <Link href="https://www.google.com" target="_blank">
      Link target blank
    </Link>
    <div style={{ width: 150 }}>
      <Link href="https://www.google.com" maxRows={1}>
        <strong>Strong</strong> and <small>small</small> truncation example
      </Link>
    </div>
    <Link href="https://www.google.com" color="secondary">
      Secondary Link
    </Link>
    <Link href="https://www.google.com" color="accent">
      Accent Link
    </Link>
    <Text color="error">
      <Link href="https://www.google.com" color="inherit">
        Inherit Link
      </Link>
    </Text>
    <Link
      href="https://www.google.com"
      style={{ color: "var(--salt-content-foreground-visited)" }}
    >
      Forced visited
    </Link>
    <Link
      href="https://www.google.com"
      target="_blank"
      IconComponent={UserIcon}
    >
      Custom icon
    </Link>
    <Link href="https://www.google.com" target="_blank" IconComponent={null}>
      No icon
    </Link>
    <Link href="https://www.google.com" underline="never">
      Underline never
    </Link>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
