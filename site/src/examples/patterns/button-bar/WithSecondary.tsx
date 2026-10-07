import { Button, FlexItem, SplitLayout, StackLayout } from "@salt-ds/core";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

export const WithSecondary = () => {
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
          <ExportIcon />
          Export
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          <ImportIcon />
          Import
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        gap={1}
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
      />
    </div>
  );
};
