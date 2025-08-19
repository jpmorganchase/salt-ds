import { Pagination, Paginator, StackLayout } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const BoundaryCount = (): ReactElement => {
  const [boundaryCount, setBoundaryCount] = useState(1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    setBoundaryCount(value);
  };

  return (
    <StackLayout>
      <input
        type="number"
        value={boundaryCount?.toString()}
        onChange={handleChange}
        style={{ width: 50 }}
      />
      <Pagination count={20} defaultPage={10}>
        <Paginator boundaryCount={boundaryCount} />
      </Pagination>
    </StackLayout>
  );
};
