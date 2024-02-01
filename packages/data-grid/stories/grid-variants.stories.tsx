import {
  Grid,
  GridColumn,
  NumericColumn,
  RowSelectionCheckboxColumn,
} from "../src";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import {
  Checkbox,
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
  useDensity,
} from "@salt-ds/core";
import "./grid.stories.css";
import { StoryFn } from "@storybook/react";
import { DummyRow, dummyRowKeyGetter, rowData } from "./dummyData";
import { clsx } from "clsx";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

type Variant = "primary" | "secondary" | "zebra";

const GridVariantsTemplate: StoryFn<{}> = () => {
  const [separators, setSeparators] = useState(false);
  const [uhd, setUhd] = useState(false);
  const [variant, setVariant] = useState<Variant>("primary");

  const density = useDensity();

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as Variant);
  };

  const onUhdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUhd(event.target.checked);
  };

  const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeparators(event.target.checked);
  };

  return (
    <FlexLayout direction="column">
      <FlexItem>
        <FlexLayout direction="row">
          <FlexItem>
            <ToggleButtonGroup onChange={onVariantChange} value={variant}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="zebra">Zebra</ToggleButton>
            </ToggleButtonGroup>
          </FlexItem>
          <FlexItem>
            <Checkbox
              checked={separators}
              label="Column separators"
              onChange={onSeparatorsChange}
            />
          </FlexItem>
          <FlexItem>
            <Checkbox
              checked={density === "high" && uhd}
              label="Compact (for high density only)"
              onChange={onUhdChange}
              disabled={density !== "high"}
            />
          </FlexItem>
        </FlexLayout>
      </FlexItem>
      <Grid
        rowData={rowData}
        rowKeyGetter={dummyRowKeyGetter}
        className={clsx("grid", { ["grid-uhd"]: uhd })}
        variant={variant !== "zebra" ? variant : "primary"}
        zebra={variant === "zebra"}
        columnSeparators={separators}
        headerIsFocusable={true}
      >
        <RowSelectionCheckboxColumn id="s" />
        <GridColumn name="A" id="a" defaultWidth={50} getValue={(r) => r.a} />
        <NumericColumn
          name="B"
          id="b"
          defaultWidth={100}
          precision={2}
          getValue={(r: DummyRow) => r.b}
          align={"right"}
        />
        <GridColumn name="C" id="c" defaultWidth={50} getValue={(r) => r.c} />
      </Grid>
    </FlexLayout>
  );
};

export const GridVariants = GridVariantsTemplate.bind({});
