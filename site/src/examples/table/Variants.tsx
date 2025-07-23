import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import {
  Table,
  type TableProps,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@salt-ds/lab";
import { type ReactElement, type SyntheticEvent, useState } from "react";

export const Variants = (): ReactElement => {
  const [variant, setVariant] = useState<TableProps["variant"]>("primary");

  const onChangeVariant = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as TableProps["variant"]);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <ToggleButtonGroup onChange={onChangeVariant} value={variant}>
        <ToggleButton value="primary">Primary</ToggleButton>
        <ToggleButton value="secondary">Secondary</ToggleButton>
        <ToggleButton value="tertiary">Tertiary</ToggleButton>
      </ToggleButtonGroup>
      <Table variant={variant}>
        <THead>
          <TR>
            {Array.from({ length: 3 }, (arrItem, i) => {
              return <TH key={`col-${arrItem}`}>Column {i + 1}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: 5 }, (arrItem, x) => {
            return (
              <TR key={`tr-${arrItem}`}>
                {Array.from({ length: 3 }, (nestedArrItem) => {
                  return <TD key={`td-${nestedArrItem}`}>Row {x + 1}</TD>;
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            {Array.from({ length: 3 }, (arrItem, i) => {
              return <TD key={`footer-${arrItem}`}>Footer {i + 1}</TD>;
            })}
          </TR>
        </TFoot>
      </Table>
    </StackLayout>
  );
};
