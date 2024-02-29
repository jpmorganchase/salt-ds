import { H1, Text } from "@salt-ds/core";

import { LinkCard } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";

export default {
  title: "Lab/Link Card/Link Card QA",
  component: LinkCard,
} as Meta<typeof LinkCard>;

export const AllExamplesUsingText: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <LinkCard>
        <H1>Card with density</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="secondary">
        <H1>Secondary card with density</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="top">
        <H1>Card with accent and density</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="secondary" accent="bottom">
        <H1>Secondary card with accent and density</H1>
        <Text>Content</Text>
      </LinkCard>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection itemPadding={10} itemWidthAuto {...props}>
    <LinkCard>
      <H1>Card with density</H1>
      <Text>Content</Text>
    </LinkCard>
    <LinkCard variant="secondary">
      <H1>Secondary card with density</H1>
      <Text>Content</Text>
    </LinkCard>
    <LinkCard accent="top">
      <H1>Card with accent and density</H1>
      <Text>Content</Text>
    </LinkCard>
    <LinkCard variant="secondary" accent="bottom">
      <H1>Secondary card with accent and density</H1>
      <Text>Content</Text>
    </LinkCard>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
