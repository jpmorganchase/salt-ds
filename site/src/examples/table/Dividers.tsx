import {
  FlexItem,
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

export const Dividers = (): ReactElement => {
  const [body, setBody] = useState("tertiary");
  const [header, setHeader] = useState("primary");
  const [footer, setFooter] = useState("primary");

  const onChangeBody = (event: SyntheticEvent<HTMLButtonElement>) => {
    setBody(event.currentTarget.value);
  };

  const onChangeHeader = (event: SyntheticEvent<HTMLButtonElement>) => {
    setHeader(event.currentTarget.value);
  };

  const onChangeFooter = (event: SyntheticEvent<HTMLButtonElement>) => {
    setFooter(event.currentTarget.value);
  };

  return (
    <StackLayout style={{ width: "90%" }}>
      <FlexLayout align="start" direction="column">
        <FlexItem>
          <FormField>
            <FormFieldLabel>Header</FormFieldLabel>
            <ToggleButtonGroup onChange={onChangeHeader} value={header}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="tertiary">Tertiary</ToggleButton>
            </ToggleButtonGroup>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField>
            <FormFieldLabel>Body</FormFieldLabel>
            <ToggleButtonGroup onChange={onChangeBody} value={body}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="tertiary">Tertiary</ToggleButton>
            </ToggleButtonGroup>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField>
            <FormFieldLabel>Footer</FormFieldLabel>
            <ToggleButtonGroup onChange={onChangeFooter} value={footer}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="tertiary">Tertiary</ToggleButton>
            </ToggleButtonGroup>
          </FormField>
        </FlexItem>
      </FlexLayout>
      <Table divider={body as TableProps["divider"]}>
        <THead divider={header as TableProps["divider"]}>
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
        <TFoot divider={footer as TableProps["divider"]}>
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
