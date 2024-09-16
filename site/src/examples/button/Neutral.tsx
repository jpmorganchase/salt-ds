import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Neutral = (): ReactElement => (
  <>
    <Button sentiment="neutral" appearance="solid">
      Solid
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      Bordered
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      Transparent
    </Button>
  </>
);
