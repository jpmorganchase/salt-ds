import { FlexLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const VisualLabel = (): ReactElement => (
  <FlexLayout direction="column" gap={2}>
    <Rating
      labelPosition="right"
      semanticLabels={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
    />
    <Rating
      value={4}
      semanticLabels={(value, max) => `${value}/${max}`}
    />
  </FlexLayout>
);
