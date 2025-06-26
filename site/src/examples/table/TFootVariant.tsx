import {
  TBody,
  TD,
  TFoot,
  TFootVariantValues,
  TH,
  THead,
  TR,
  Table,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import { StackLayout } from "src/components";

export const TFootVariant = (): ReactElement => {
  return (
    <StackLayout>
      {TFootVariantValues.map((variant) => {
        return (
          <Table>
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
            <TFoot variant={variant}>
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
