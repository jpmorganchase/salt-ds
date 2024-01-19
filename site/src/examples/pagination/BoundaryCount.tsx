import { ChangeEvent, ReactElement, useState } from "react";
import { Pagination, Paginator, StackLayout } from "@salt-ds/core";

export const BoundaryCount = (): ReactElement => {
  const [boundaryCount, setBoundaryCount] = useState(1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setBoundaryCount(value);
  };

  return (
    <>
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
    </>
  );
};
