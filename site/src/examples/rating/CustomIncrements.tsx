import { FlexLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CustomIncrements = (): ReactElement => {
  return (
    <FlexLayout direction="column" gap={3}>
      <Rating
        aria-label="Rating"
        defaultValue={1}
        onChange={(event, value) => console.log(event, value)}
      />
      <Rating
        aria-label="Rating"
        defaultValue={7}
        max={10}
        onChange={(event, value) => console.log(event, value)}
      />
    </FlexLayout>
  );
};
