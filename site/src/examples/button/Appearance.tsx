import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <>
    <Button appearance="solid" color="accent">
      Solid
    </Button>
    <Button appearance="outline" color="accent">
      Outline
    </Button>
    <Button appearance="transparent" color="accent">
      Transparent
    </Button>
  </>
);
