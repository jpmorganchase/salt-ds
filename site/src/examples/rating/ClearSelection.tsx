import { FlexLayout, FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ClearSelection = (): ReactElement => (
    <FlexLayout direction="column" gap={3}>
        <FormField labelPlacement="top">
            <FormFieldLabel>Click to clear selection</FormFieldLabel>
            <Rating value={3} allowClear={true} onValueChange={(value) => console.log(value)} />
        </FormField>
        <FormField labelPlacement="top">
            <FormFieldLabel>Prevent Clearing Selection</FormFieldLabel>
            <Rating value={3} allowClear={false} onValueChange={(value) => console.log(value)} />
        </FormField>
  </FlexLayout>
);
