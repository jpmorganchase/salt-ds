import { FlowLayout, MultilineInput, Text } from "@salt-ds/core";
import {
  BankCheckSolidIcon,
  EditSolidIcon,
  HelpSolidIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const StaticAdornments = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <MultilineInput startAdornment={<Text>£</Text>} defaultValue="Value" />
    <MultilineInput endAdornment={<Text>GBP</Text>} defaultValue="1000" />
    <MultilineInput
      startAdornment={<BankCheckSolidIcon />}
      endAdornment={
        <>
          <EditSolidIcon />
          <HelpSolidIcon />
        </>
      }
      defaultValue="JPMC"
    />
    <MultilineInput
      disabled
      endAdornment={<Text disabled>JPMC</Text>}
      defaultValue="Disabled value"
    />
  </FlowLayout>
);
