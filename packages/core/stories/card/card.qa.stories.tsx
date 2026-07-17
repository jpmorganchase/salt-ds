import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  H1,
  Panel,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Card/Card QA",
  component: Card,
} as Meta<typeof Card>;

export const AllExamplesUsingText: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <Card>
        <H1>Primary card</H1>
        <Text>Content</Text>
      </Card>
      <Card variant="secondary">
        <H1>Secondary card</H1>
        <Text>Content</Text>
      </Card>
      <Card variant="tertiary">
        <H1>Tertiary card</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="top">
        <H1>Accent top</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="right">
        <H1>Accent right</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="bottom">
        <H1>Accent bottom</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="left">
        <H1>Accent left</H1>
        <Text>Content</Text>
      </Card>
      <Card>
        <CardContent>
          <H1>With CardContent</H1>
          <Text>Content</Text>
        </CardContent>
      </Card>
      <Card accent="top">
        <Panel variant="secondary" style={{ height: 20 }} />
        <CardContent>
          <H1>Panel + CardContent</H1>
          <Text>Content</Text>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <H1>Card header</H1>
        </CardHeader>
        <CardContent>
          <Text>Card content</Text>
        </CardContent>
        <CardFooter>
          <Text color="secondary">Card footer</Text>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <H1>Header only</H1>
        </CardHeader>
      </Card>
      <StackLayout align="stretch" direction="row" gap={2}>
        <Card style={{ minHeight: 220, width: 180 }}>
          <CardHeader>
            <H1>With content</H1>
          </CardHeader>
          <CardContent>
            <Text>Content fills the available height.</Text>
          </CardContent>
          <CardFooter>
            <Text color="secondary">Footer</Text>
          </CardFooter>
        </Card>
        <Card style={{ minHeight: 220, width: 180 }}>
          <CardHeader>
            <H1>Without content</H1>
          </CardHeader>
          <CardFooter>
            <Text color="secondary">Footer</Text>
          </CardFooter>
        </Card>
      </StackLayout>
      <Panel variant="tertiary">
        <Card variant="ghost">
          <H1>Ghost card</H1>
          <Text>Content</Text>
        </Card>
      </Panel>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
