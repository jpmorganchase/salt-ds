import {
  FormField,
  FormFieldLabel,
  NumberInput,
  Pagination,
  Paginator,
  StackLayout,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const SiblingPairCount = (): ReactElement => {
  const [siblingCount, setSiblingCount] = useState(2);

  return (
    <StackLayout>
      <FormField style={{ width: 180 }}>
        <FormFieldLabel>Sibling count</FormFieldLabel>
        <NumberInput
          value={siblingCount.toString()}
          min={0}
          onChange={(_event, value) => {
            const parsed = Number.parseInt(value, 10);
            setSiblingCount(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
      </FormField>
      <Pagination count={20} defaultPage={10}>
        <Paginator siblingCount={siblingCount} />
      </Pagination>
    </StackLayout>
  );
};
