import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  useId,
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

export const Variants = (): ReactElement => {
  const [variant, setVariant] = useState<TableProps["variant"]>("primary");
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
      <TableContainer>
        <Table
          variant={variant}
          divider={divider === "on" ? "tertiary" : "none"}
        >
          <caption id={id}>Table with variants</caption>
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
