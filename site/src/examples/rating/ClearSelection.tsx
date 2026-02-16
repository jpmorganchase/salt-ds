import { Button } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const ClearSelection = (): ReactElement => {
  const [value, setValue] = useState<number>(3);

  return (
    <>
      <Rating
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
      />
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => setValue(0)}
      >
        clear
      </Button>
    </>
  );
};
