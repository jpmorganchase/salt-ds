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

export const THeadVariant = (): ReactElement => {
  const [variant, setVariant] = useState<TableProps["variant"]>("secondary");
  const [divider, setDivider] = useState<"on" | "off">("on");

  const onChangeVariant = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as TableProps["variant"]);
  };

  const onChangeDivider = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDivider(event.currentTarget.value as "on" | "off");
  };

  return (
    <StackLayout style={{ width: "100%" }}>
      <FlexLayout direction="row">
        <FormField>
          <FormFieldLabel>Variant</FormFieldLabel>
          <ToggleButtonGroup onChange={onChangeVariant} value={variant}>
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
      <Table>
        <THead
          variant={variant}
          divider={divider === "on" ? "primary" : "none"}
        >
          <TR>
            {Array.from({ length: 3 }, (_arrItem, i) => {
              return <TH key={`col-${i}`}>Column {i + 1}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: 5 }, (_arrItem, x) => {
            return (
              <TR key={`tr-${x}`}>
                {Array.from({ length: 3 }, (_nestedArrItem, i) => {
                  return <TD key={`td-${i}`}>Row {x + 1}</TD>;
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            {Array.from({ length: 3 }, (_arrItem, i) => {
              return <TD key={`footer-${i}`}>Footer {i + 1}</TD>;
            })}
          </TR>
        </TFoot>
      </Table>
    </StackLayout>
  );
};
