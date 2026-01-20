import {
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
  TH,
  THead,
  ToggleButton,
  ToggleButtonGroup,
  TR,
} from "@salt-ds/core";
import { type ReactElement, type SyntheticEvent, useId, useState } from "react";

export const TFootVariant = (): ReactElement => {
  const [variant, setVariant] = useState<TableProps["variant"]>("secondary");
  const [divider, setDivider] = useState<"on" | "off">("on");

  const onChangeVariant = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as TableProps["variant"]);
  };

  const onChangeDivider = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDivider(event.currentTarget.value as "on" | "off");
  };

  const id = useId();

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
      <TableContainer aria-labelledby={id}>
        <Table>
          <caption id={id}>Table with TFoot variants</caption>
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
          <TFoot
            variant={variant}
            divider={divider === "on" ? "primary" : "none"}
          >
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
