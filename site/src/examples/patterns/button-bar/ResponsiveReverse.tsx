import {
  Button,
  FlexItem,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  useResponsiveProp,
} from "@salt-ds/core";
import type { ElementType } from "react";

export const ResponsiveReverse = () => {
  const bordered = (
    <FlexItem>
      <Button appearance="bordered" style={{ width: "100%" }}>
        Cancel
      </Button>
    </FlexItem>
  );

  const transparent = (
    <FlexItem>
      <Button appearance="transparent" style={{ width: "100%" }}>
        Delete
      </Button>
    </FlexItem>
  );

  const accented = (
    <FlexItem>
      <Button sentiment="accented" style={{ width: "100%" }}>
        Save
      </Button>
    </FlexItem>
  );

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const startItem = <StackLayout gap={1}>{transparent}</StackLayout>;

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      {bordered}
      {accented}
    </StackLayout>
  );

  const columnStack = (
    <StackLayout direction="column" gap={1} style={{ width: "100%" }}>
      {accented}
      {bordered}
      {transparent}
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      {direction === "column" ? (
        columnStack
      ) : (
        <SplitLayout
          startItem={startItem}
          endItem={endItem}
          style={{ width: "100%" }}
          direction={direction}
        />
      )}
    </div>
  );
};
