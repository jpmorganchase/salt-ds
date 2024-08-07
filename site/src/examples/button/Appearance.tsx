import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <>
    <Button appearance="filled" chrome="accent">
      Filled
    </Button>
    <Button appearance="outlined" chrome="accent">
      Outlined
    </Button>
    <Button appearance="minimal" chrome="accent">
      Minimal
    </Button>
  </>
);
