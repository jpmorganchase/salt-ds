import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const TextAlignment = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          <TH>City</TH>
          <TH textAlign="right">Population</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TD>London</TD>
          <TD textAlign="right">9.8 million</TD>
        </TR>
        <TR>
          <TD>New York</TD>
          <TD textAlign="right">8.8 million</TD>
        </TR>
      </TBody>
    </Table>
  );
};
