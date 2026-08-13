import { Link, Text } from "@salt-ds/core";
import { TearOutIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Link/Link QA",
  component: Link,
} as Meta<typeof Link>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Link href="/salt/components">Browse component documentation</Link>
    <Link
      href="https://www.saltdesignsystem.com"
      target="_blank"
      rel="noopener"
    >
      Visit Salt
    </Link>
    <div style={{ width: 150 }}>
      <Link href="https://github.com/salt-ds/core" maxRows={1}>
        View <strong>Salt Core</strong> <small>package</small> source
      </Link>
    </div>
    <Link href="/salt/about/supported-platforms" color="secondary">
      View supported platforms
    </Link>
    <Link
      href="/salt/foundations/data-visualization/color-and-pattern"
      color="accent"
    >
      Read color guidance
    </Link>
    <Text color="error">
      <Link href="/salt/components/form-field/accessibility" color="inherit">
        Review validation guidance
      </Link>
    </Text>
    <Link
      href="/salt/about/roadmap"
      style={{ color: "var(--salt-content-foreground-visited)" }}
    >
      View roadmap
    </Link>
    <Link
      href="https://github.com/jpmorganchase/salt-ds"
      target="_blank"
      rel="noopener"
      IconComponent={TearOutIcon}
    >
      View Salt source
    </Link>
    <Link href="/salt/components/navigation-item" underline="never">
      View navigation guidance
    </Link>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
