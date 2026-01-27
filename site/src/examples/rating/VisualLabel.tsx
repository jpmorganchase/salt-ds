import { FlexLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
export const VisualLabel = (): ReactElement => (
  <FlexLayout direction="column" gap={2}>
    <Rating
      labelPlacement="right"
      getLabel={(value) => labels[value - 1] || "No rating"}
    />
    <Rating value={4} getLabel={(value, max) => `${value}/${max}`} />
  </FlexLayout>
);
