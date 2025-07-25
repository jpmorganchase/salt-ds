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
  type TFootProps,
  TH,
  THead,
  type THeadProps,
  TR,
} from "@salt-ds/lab";
import { type ReactElement, type SyntheticEvent, useState } from "react";

export const Dividers = (): ReactElement => {
  const [body, setBody] = useState<TableProps["divider"]>("tertiary");
  const [header, setHeader] = useState<THeadProps["divider"]>("primary");
  const [footer, setFooter] = useState<TFootProps["divider"]>("primary");

  const onChangeBody = (event: SyntheticEvent<HTMLButtonElement>) => {
    setBody(event.currentTarget.value as TableProps["divider"]);
  };

  const onChangeHeader = (event: SyntheticEvent<HTMLButtonElement>) => {
    setHeader(event.currentTarget.value as THeadProps["divider"]);
  };

  const onChangeFooter = (event: SyntheticEvent<HTMLButtonElement>) => {
    setFooter(event.currentTarget.value as TFootProps["divider"]);
  };

  return (
    <StackLayout style={{ width: "90%" }}>
      <FlexLayout align="start" direction="row">
        <FlexItem>
          <FormField>
            <FormFieldLabel>Header</FormFieldLabel>
            <ToggleButtonGroup onChange={onChangeHeader} value={header}>
              <ToggleButton value="primary">On</ToggleButton>
              <ToggleButton value="none">Off</ToggleButton>
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
              <ToggleButton value="primary">On</ToggleButton>
              <ToggleButton value="none">Off</ToggleButton>
            </ToggleButtonGroup>
          </FormField>
        </FlexItem>
      </FlexLayout>
      <Table divider={body}>
        <THead divider={header}>
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
        <TFoot divider={footer}>
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
