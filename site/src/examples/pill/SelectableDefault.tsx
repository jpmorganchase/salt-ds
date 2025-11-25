import { Pill, PillGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const SelectableDefault = (): ReactElement => (
  <PillGroup aria-label="Select Outdoor Activities">
    <Pill value="biking">Biking</Pill>
    <Pill value="hiking">Hiking</Pill>
    <Pill value="cycling">Cycling</Pill>
  </PillGroup>
);
