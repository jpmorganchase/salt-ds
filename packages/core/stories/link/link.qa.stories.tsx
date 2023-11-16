import { Link } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
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
    <Link href="https://www.google.com" variant="secondary">
      Secondary Link
    </Link>
    <Link href="https://www.google.com" variant="secondary" target="_blank">
      Secondary Link target blank
    </Link>
    <div style={{ width: 150 }}>
      <Link href="https://www.google.com" maxRows={1} variant="secondary">
        <strong>Strong</strong> and <small>small</small> truncation example
      </Link>
    </div>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
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
    <Link href="https://www.google.com" variant="secondary">
      Secondary Link
    </Link>
    <Link href="https://www.google.com" variant="secondary" target="_blank">
      Secondary Link target blank
    </Link>
    <div style={{ width: 150 }}>
      <Link href="https://www.google.com" maxRows={1} variant="secondary">
        <strong>Strong</strong> and <small>small</small> truncation example
      </Link>
    </div>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
