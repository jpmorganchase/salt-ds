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
  TableContainer,
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
      <TableContainer aria-label="Zebra table with variants">
        <Table
          zebra
          variant={variant}
          divider={divider === "on" ? "tertiary" : "none"}
        >
          <THead>
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
          <TFoot>
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
