import { FlexLayout, FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ClearSelection = (): ReactElement => (
  <FlexLayout direction="column" gap={3}>
    <FormField labelPlacement="top">
      <FormFieldLabel>Click to clear selection</FormFieldLabel>
      <Rating
        defaultValue={3}
        enableDeselect={true}
        onChange={(event, value) => console.log(value)}
      />
    </FormField>
    <FormField labelPlacement="top">
      <FormFieldLabel>Prevent Clearing Selection</FormFieldLabel>
      <Rating
        defaultValue={3}
        enableDeselect={false}
        onChange={(event, value) => console.log(value)}
      />
    </FormField>
  </FlexLayout>
);
