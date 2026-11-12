import { Button, FlexItem, SplitLayout, StackLayout } from "@salt-ds/core";

export const DestructiveActions = () => {
  const startItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button sentiment="accented" style={{ width: "100%" }}>
          Save
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="bordered" style={{ width: "100%" }}>
          Cancel
        </Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          Delete
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        direction={{ xs: "column", sm: "row" }}
        gap={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};
