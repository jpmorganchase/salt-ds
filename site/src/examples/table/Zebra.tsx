import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
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

export const Zebra = (): ReactElement => {
  const [zebra, setZebra] = useState<TableProps["zebra"]>("secondary");
  const [divider, setDivider] = useState<"on" | "off">("on");

  const onChangeZebra = (event: SyntheticEvent<HTMLButtonElement>) => {
    setZebra(event.currentTarget.value as TableProps["zebra"]);
  };

  const onChangeDivider = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDivider(event.currentTarget.value as "on" | "off");
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <FlexLayout direction="row">
        <FormField>
          <FormFieldLabel>Zebra</FormFieldLabel>
          <ToggleButtonGroup onChange={onChangeZebra} value={zebra}>
            <ToggleButton value="primary">Primary</ToggleButton>
            <ToggleButton value="secondary">Secondary</ToggleButton>
            <ToggleButton value="tertiary">Tertiary</ToggleButton>
          </ToggleButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Divider</FormFieldLabel>
          <ToggleButtonGroup onChange={onChangeDivider} value={divider}>
            <ToggleButton value="on">On</ToggleButton>
            <ToggleButton value="off">Off</ToggleButton>
          </ToggleButtonGroup>
        </FormField>
      </FlexLayout>
      <Table zebra={zebra} divider={divider === "on" ? "tertiary" : "none"}>
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
