import { Button, FlexItem, FlowLayout, SplitLayout } from "@salt-ds/core";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <SplitLayout direction="row">
      <FlexItem>
        <Button variant="cta">Save</Button>
        <Button>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="secondary">Delete</Button>
      </FlexItem>
    </SplitLayout>
  );
};

export const WithSecondary = () => {
  const startItem = (
    <FlowLayout>
      <FlexItem>
        <Button variant="secondary">Start/secondary</Button>
      </FlexItem>
    </FlowLayout>
  );

  const endItem = (
    <FlowLayout>
      <FlexItem>
        <Button>End/primary</Button>
      </FlexItem>
    </FlowLayout>
  );

  return (
    <SplitLayout
      startItem={startItem}
      endItem={endItem}
      style={{minWidth: '30vw'}}
      direction={{ xs: "column", sm: "row" }}
    />
  );
};
