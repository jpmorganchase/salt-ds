import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <>
    <Button appearance="solid">Solid</Button>
    <Button appearance="bordered">Bordered</Button>
    <Button appearance="transparent">Transparent</Button>
  </>
);
