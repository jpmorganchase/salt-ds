import { FlexLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
export const VisualLabel = (): ReactElement => (
  <FlexLayout direction="column" gap={3}>
    <Rating
      defaultValue={4}
      getVisibleLabel={(value, max) => `${value}/${max}`}
    />
    <Rating
      defaultValue={4}
      getVisibleLabel={(value) => labels[value - 1] || "No rating"}
      getLabel={(value) => labels[value - 1]}
    />
    <Rating
      labelPlacement="left"
      defaultValue={4}
      getVisibleLabel={(value) => labels[value - 1] || "No rating"}
      getLabel={(value) => labels[value - 1]}
      className="custom-rating-width"
    />
    <style>
      {".custom-rating-width .saltRating-label { min-width: 9ch; }"}
    </style>
  </FlexLayout>
);
