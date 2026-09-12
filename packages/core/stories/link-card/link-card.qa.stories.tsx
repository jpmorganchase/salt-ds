import {
  CardContent,
  CardFooter,
  CardHeader,
  H1,
  LinkCard,
  Panel,
  Text,
} from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Link Card/Link Card QA",
  component: LinkCard,
} as Meta<typeof LinkCard>;

const headingStyle = { marginBottom: "var(--salt-spacing-300)" };

export const AllExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer itemPadding={4} cols={4} itemWidthAuto {...props}>
      <LinkCard>
        <H1 style={headingStyle}>Primary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="secondary">
        <H1 style={headingStyle}>Secondary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard variant="tertiary">
        <H1 style={headingStyle}>Tertiary card</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="top">
        <H1 style={headingStyle}>Accent top</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="right">
        <H1 style={headingStyle}>Accent right</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="bottom">
        <H1 style={headingStyle}>Accent bottom</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard accent="left">
        <H1 style={headingStyle}>Accent left</H1>
        <Text>Content</Text>
      </LinkCard>
      <LinkCard>
        <CardContent>
          <H1 style={headingStyle}>With CardContent</H1>
          <Text>Content</Text>
        </CardContent>
      </LinkCard>
      <LinkCard>
        <Panel variant="secondary" style={{ height: 20 }} />
        <CardContent>
          <H1 style={headingStyle}>Panel + CardContent</H1>
          <Text>Content</Text>
        </CardContent>
      </LinkCard>
      <LinkCard>
        <CardHeader>
          <H1>Link card header</H1>
        </CardHeader>
        <CardContent>
          <Text>Link card content</Text>
        </CardContent>
        <CardFooter>
          <Text color="secondary">Link card footer</Text>
        </CardFooter>
      </LinkCard>
    </QAContainer>
  );
};
AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
