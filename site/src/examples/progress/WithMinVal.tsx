import {
  CircularProgress,
  FlexItem,
  H3,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithMinVal = (): ReactElement => {
  const max = 40;
  const min = 20;
  const value = 30;
  return (
    <StackLayout align="center">
      <H3>{`max = ${max}, min = ${min}, value = ${value}`}</H3>

      <FlexItem>
        <CircularProgress
          aria-label="Download"
          value={value}
          min={min}
          max={max}
        />
      </FlexItem>
      <FlexItem>
        <LinearProgress
          aria-label="Download"
          value={value}
          min={min}
          max={max}
        />
      </FlexItem>
    </StackLayout>
  );
};
