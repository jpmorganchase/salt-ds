import { ChangeEvent, ReactElement, useState } from "react";
import { StackLayout } from "@salt-ds/core";
import { Pagination, Paginator } from "@salt-ds/lab";

export const SiblingPairCount = (): ReactElement => {
  const [siblingCount, setSiblingCount] = useState(2);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSiblingCount(value);
  };

  return (
    <>
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
    </>
  );
};
