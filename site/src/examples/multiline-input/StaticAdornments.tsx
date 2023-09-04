import { ReactElement } from "react";
import { Text, FlowLayout, MultilineInput } from "@salt-ds/core";
import {
  BankCheckSolidIcon,
  EditSolidIcon,
  HelpSolidIcon,
} from "@salt-ds/icons";

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
