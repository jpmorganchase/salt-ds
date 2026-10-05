import { Button, makePrefixer, StackLayout, Text } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";

// Utilities that don't use React can still be called on the server.
const withBaseName = makePrefixer("serverComponent");

export default function CorePage() {
  return (
    <StackLayout>
      <Text className={withBaseName("text")}>Core components</Text>
      <Button>Button</Button>
      <AddIcon aria-label="Add" />
    </StackLayout>
  );
}
