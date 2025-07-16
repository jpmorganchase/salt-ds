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
  const [variant, setVariant] = useState("primary");

  const onChangeVariant = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value);
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <ToggleButtonGroup onChange={onChangeVariant} value={variant}>
        <ToggleButton value="primary">Primary</ToggleButton>
        <ToggleButton value="secondary">Secondary</ToggleButton>
        <ToggleButton value="tertiary">Tertiary</ToggleButton>
      </ToggleButtonGroup>
      <Table variant={variant as TableProps["variant"]}>
        <THead>
          <TR>
            {Array.from({ length: 3 }, (_, i) => {
              return <TH key={`col-${i}`}>Column {i + 1}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: 5 }, (_, x) => {
            return (
              <TR key={`tr-${x}`}>
                {Array.from({ length: 3 }, (_, i) => {
                  return <TD key={`td-${i}`}>Row {x + 1}</TD>;
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            {Array.from({ length: 3 }, (_, i) => {
              return <TD key={`footer-${i}`}>Footer {i + 1}</TD>;
            })}
          </TR>
        </TFoot>
      </Table>
    </StackLayout>
  );
};
