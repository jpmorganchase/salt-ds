import { Pagination, Paginator, StackLayout } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const SiblingPairCount = (): ReactElement => {
  const [siblingCount, setSiblingCount] = useState(2);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    setSiblingCount(value);
  };

  return (
    <StackLayout>
      <input
        type="number"
        value={siblingCount?.toString()}
        onChange={handleChange}
        style={{ width: 50 }}
      />
      <Pagination count={20} defaultPage={10}>
        <Paginator siblingCount={siblingCount} />
      </Pagination>
    </StackLayout>
  );
};
