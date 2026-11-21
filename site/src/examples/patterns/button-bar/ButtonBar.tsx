import { Button, FlexItem, StackLayout } from "@salt-ds/core";

export const ButtonBar = () => {
  return (
    <div style={{ width: "40vw" }}>
      <StackLayout
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
        gap={1}
      >
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
    </div>
  );
};
