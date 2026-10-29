import {
  FormField,
  FormFieldLabel,
  NumberInput,
  Pagination,
  Paginator,
  StackLayout,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const BoundaryCount = (): ReactElement => {
  const [boundaryCount, setBoundaryCount] = useState(1);

  return (
    <StackLayout>
      <FormField style={{ width: 180 }}>
        <FormFieldLabel>Boundary count</FormFieldLabel>
        <NumberInput
          value={boundaryCount.toString()}
          min={0}
          onChange={(_event, value) => {
            const parsed = Number.parseInt(value, 10);
            setBoundaryCount(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
      </FormField>
      <Pagination count={20} defaultPage={10}>
        <Paginator boundaryCount={boundaryCount} />
      </Pagination>
    </StackLayout>
  );
};
