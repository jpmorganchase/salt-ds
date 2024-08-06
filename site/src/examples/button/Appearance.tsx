import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <>
    <Button appearance="solid" color="accent">
      Solid
    </Button>
    <Button appearance="bordered" color="accent">
      Bordered
    </Button>
    <Button appearance="transparent" color="accent">
      Transparent
    </Button>
  </>
);
