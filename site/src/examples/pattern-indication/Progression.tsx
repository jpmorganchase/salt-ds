import { StackLayout } from "@salt-ds/core";
import { Grid, type GridCellValueProps, GridColumn } from "@salt-ds/data-grid";
import {
  type IconProps,
  ProgressDraftIcon,
  ProgressTodoIcon,
} from "@salt-ds/icons";
import type { FC } from "react";
import {
  ColorCellValue,
  type ColorValueCellProps,
  IconDisplay,
} from "./ValueCells";

type ProgressionData = {
  progression: string;
  icons: { name: string; ExampleIcon: FC<IconProps> }[];
  usage: string[];
} & ColorValueCellProps;

const data = [
  {
    progression: "Static",
    color: "gray",
    icons: [
      { name: "progress-todo", ExampleIcon: ProgressTodoIcon },
      { name: "progress-draft", ExampleIcon: ProgressDraftIcon },
    ],
    usage: [
      "To do – An item that is ready to be picked up or assigned to a user",
      "Draft – An item has been picked up or assigned to a user, and is ready to be worked on/addressed",
    ],
  },
] satisfies ProgressionData[];

const rowIdGetter = (row: ProgressionData) => row.progression;

const IconValueCell = (props: GridCellValueProps<ProgressionData>) => {
  const { row } = props;

  const { color, icons } = row.data;

  return (
    <StackLayout gap={1}>
      {icons.map(({ ExampleIcon, name }) => (
        <IconDisplay
          iconName={name}
          ExampleIcon={ExampleIcon}
          color={color}
          key={name}
        />
      ))}
    </StackLayout>
  );
};

export const Progression = () => {
  return (
    <Grid
      rowData={data}
      rowKeyGetter={rowIdGetter}
      zebra={false}
      style={{
        width: "var(--grid-total-width)",
        height: "var(--grid-total-height)",
      }}
    >
      <GridColumn
        name="Progression"
        id="progression"
        defaultWidth={100}
        getValue={(r) => r.progression}
      />
      <GridColumn
        name="Color"
        id="color"
        defaultWidth={120}
        getValue={(r) => r.color}
        cellValueComponent={ColorCellValue}
      />
      <GridColumn
        name="Icon"
        id="icon"
        defaultWidth={150}
        getValue={(r) => r.progression}
        cellValueComponent={IconValueCell}
      />
    </Grid>
  );
};
