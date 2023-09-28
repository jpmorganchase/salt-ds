import type { Decorator } from "@storybook/react";
import { H1, H2, Text, Link, StackLayout } from "@salt-ds/core";

/** A storybook decorator that adds a scaffold around a story */
export const withScaffold: Decorator = (Story, context) => {
  const { scaffold } = context.globals;

  if (scaffold === "disable") {
    return <Story {...context} />;
  }

  return (
    <StackLayout>
      <span>
        <H1>Heading level 1</H1>
        <Text>First Small paragraph</Text>
      </span>
      <span>
        <H2>First Heading level 2</H2>
        <Text>Second Small paragraph</Text>
        <Link href="#">First Link</Link> <Link href="#">Second Link</Link>
      </span>
      <Story {...context} />
      <span>
        <Link href="#">Third Link</Link> <Link href="#">Fourth Link</Link>
      </span>
      <span>
        <H2>Second Heading level 2</H2>
        <Text>Third Small paragraph</Text>
      </span>
    </StackLayout>
  );
};
