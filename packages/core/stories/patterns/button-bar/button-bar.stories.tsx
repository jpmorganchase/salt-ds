import { Button, FlexItem, StackLayout } from "@salt-ds/core";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <StackLayout direction="row">
      <FlexItem>
        <Button variant="cta">Save</Button>
      </FlexItem>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="secondary">Delete</Button>
      </FlexItem>
    </StackLayout>
  );
};
