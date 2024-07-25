import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <>
    <Button appearance="solid">Solid</Button>
    <Button appearance="outline">Outline</Button>
    <Button appearance="transparent">Transparent</Button>
  </>
);
