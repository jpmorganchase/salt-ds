import { Button, FlexItem, SplitLayout, StackLayout } from "@salt-ds/core";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

export const Responsive = () => {
  const startItem = (
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
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
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
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
        gap={1}
        startItem={startItem}
        endItem={endItem}
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
      />
    </div>
  );
};
