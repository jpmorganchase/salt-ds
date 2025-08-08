import { H1, LinkCard, Text } from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Link Card/Link Card QA",
  component: LinkCard,
} as Meta<typeof LinkCard>;

export const AllExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer itemPadding={4} cols={4} itemWidthAuto {...props}>
      <LinkCard>
        <H1>Primary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="secondary">
        <H1>Secondary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="tertiary">
        <H1>Tertiary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="top">
        <H1>Accent top</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="right">
        <H1>Accent right</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="bottom">
        <H1>Accent bottom</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="left">
        <H1>Accent left</H1>
        <Text>Content</Text>
      </LinkCard>
    </QAContainer>
  );
};
AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
