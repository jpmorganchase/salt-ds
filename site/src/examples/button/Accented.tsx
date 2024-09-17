import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Accented = (): ReactElement => (
  <>
    <Button sentiment="accented" appearance="solid">
      Solid
    </Button>
    <Button sentiment="accented" appearance="bordered">
      Bordered
    </Button>
    <Button sentiment="accented" appearance="transparent">
      Transparent
    </Button>
  </>
);
