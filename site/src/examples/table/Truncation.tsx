import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Truncation = (): ReactElement => {
  return (
    <Table style={{ width: 200 }}>
      <THead>
        <TR>
          <TH maxRows={2}>Super long column header that will wrap</TH>
          <TH>Two</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TD maxRows={2}>Super long cell content that will wrap</TD>
          <TD>Value</TD>
        </TR>
        <TR>
          <TD>Value</TD>
          <TD>Value</TD>
        </TR>
        <TR>
          <TD>Value</TD>
          <TD>Value</TD>
        </TR>
      </TBody>
    </Table>
  );
};
