import {
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
  Table,
  TableContainer,
  type TableProps,
  TBody,
  TD,
  TFoot,
  type TFootProps,
  TH,
  THead,
  type THeadProps,
  ToggleButton,
  ToggleButtonGroup,
  TR,
} from "@salt-ds/core";
import { type ReactElement, type SyntheticEvent, useId, useState } from "react";

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

  const id = useId();

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
      <TableContainer aria-labelledby={id}>
        <caption id={id}>Table with dividers</caption>
        <Table divider={body}>
          <THead divider={header}>
            <TR>
              {Array.from({ length: 3 }, (_arrItem, i) => {
                return (
                  <TH
                    // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                    key={`col-${i}`}
                  >
                    Column {i + 1}
                  </TH>
                );
              })}
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: 5 }, (_arrItem, x) => {
              return (
                <TR
                  // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                  key={`tr-${x}`}
                >
                  {Array.from({ length: 3 }, (_nestedArrItem, i) => {
                    return (
                      <TD
                        // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                        key={`td-${i}`}
                      >
                        Row {x + 1}
                      </TD>
                    );
                  })}
                </TR>
              );
            })}
          </TBody>
          <TFoot divider={footer}>
            <TR>
              {Array.from({ length: 3 }, (_arrItem, i) => {
                return (
                  <TD
                    // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                    key={`footer-${i}`}
                  >
                    Footer {i + 1}
                  </TD>
                );
              })}
            </TR>
          </TFoot>
        </Table>
      </TableContainer>
    </StackLayout>
  );
};
