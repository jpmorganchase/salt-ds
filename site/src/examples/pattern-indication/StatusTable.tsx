/** biome-ignore-all lint/correctness/useUniqueElementIds: id props aren't being used as DOM ids */
import { Grid, type GridCellValueProps, GridColumn } from "@salt-ds/data-grid";
import {
  ErrorIcon,
  type IconProps,
  InfoIcon,
  SuccessCircleIcon,
  WarningIcon,
} from "@salt-ds/icons";
import { ColorCellValue, IconDisplay } from "./ValueCells";

type StatusData = {
  status: "Info" | "Warning" | "Error" | "Success";
  color: "blue" | "orange" | "red" | "green" | "gray";
  iconName: string;
  ExampleIcon: React.FC<IconProps>;
};

const data = [
  { status: "Info", color: "blue", iconName: "info", ExampleIcon: InfoIcon },
  {
    status: "Warning",
    color: "orange",
    iconName: "warning",
    ExampleIcon: WarningIcon,
  },
  { status: "Error", color: "red", iconName: "error", ExampleIcon: ErrorIcon },
  {
    status: "Success",
    color: "green",
    iconName: "success-circle",
    ExampleIcon: SuccessCircleIcon,
  },
] as StatusData[];

const rowIdGetter = (row: StatusData) => row.status;

const IconValueCell = (props: GridCellValueProps<StatusData>) => {
  const { row } = props;

  const { iconName, ExampleIcon, color } = row.data;

  return (
    <IconDisplay iconName={iconName} ExampleIcon={ExampleIcon} color={color} />
  );
};

export const StatusTable = () => {
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
        name="Status"
        id="status"
        defaultWidth={100}
        getValue={(r) => r.status}
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
        getValue={(r) => r.iconName}
        cellValueComponent={IconValueCell}
      />
    </Grid>
  );
};
