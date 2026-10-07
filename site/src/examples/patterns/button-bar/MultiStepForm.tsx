import {
  Button,
  FlexItem,
  StackLayout,
  type StackLayoutProps,
  useResponsiveProp,
} from "@salt-ds/core";
import type { ElementType } from "react";
import { formFields } from "./SingleStepForm";

export const MultiStepForm = () => {
  const previous = (
    <FlexItem>
      <Button appearance="bordered" style={{ width: "100%" }}>
        Previous
      </Button>
    </FlexItem>
  );

  const cancel = (
    <FlexItem>
      <Button appearance="transparent" style={{ width: "100%" }}>
        Cancel
      </Button>
    </FlexItem>
  );

  const next = (
    <FlexItem>
      <Button sentiment="accented" style={{ width: "100%" }}>
        Next
      </Button>
    </FlexItem>
  );

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <StackLayout style={{ width: "330px" }}>
      {formFields}
      {direction === "column" ? (
        <StackLayout direction={"column"} style={{ width: "100%" }} gap={1}>
          {next}
          {previous}
          {cancel}
        </StackLayout>
      ) : (
        <FlexItem align={"end"}>
          <StackLayout direction={"row"} style={{ width: "100%" }} gap={1}>
            {cancel}
            {previous}
            {next}
          </StackLayout>
        </FlexItem>
      )}
    </StackLayout>
  );
};
