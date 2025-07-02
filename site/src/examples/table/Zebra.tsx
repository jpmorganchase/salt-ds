import {
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
  Table,
  TableVariantValues,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import { StackLayout } from "src/components";

export const Zebra = (): ReactElement => {
  return (
    <StackLayout>
      {TableVariantValues.map((zebra) => {
        return (
          <Table key={`${zebra}-table`} zebra={zebra}>
            <THead>
              <TR>
                {Array.from({ length: 3 }, (_, i) => {
                  return <TH key={`col-${i}`}>Column {i}</TH>;
                })}
              </TR>
            </THead>
            <TBody>
              {Array.from({ length: 2 }, (_, i) => {
                return (
                  <TR key={`tr-${i}`}>
                    {Array.from({ length: 3 }, (_, i) => {
                      return <TD key={`td-${i}`}>Row {i}</TD>;
                    })}
                  </TR>
                );
              })}
            </TBody>
            <TFoot>
              <TR>
                {Array.from({ length: 3 }, (_, i) => {
                  return <TH key={`col-${i}`}>Footer {i}</TH>;
                })}
              </TR>
            </TFoot>
          </Table>
        );
      })}
    </StackLayout>
  );
};
