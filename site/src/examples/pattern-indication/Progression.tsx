import { Code, FlexLayout, FlowLayout, StackLayout } from "@salt-ds/core";
import type { GridCellValueProps } from "@salt-ds/data-grid";
import {
  type IconProps,
  ProgressCancelledIcon,
  ProgressClosedIcon,
  ProgressCompleteIcon,
  ProgressDraftIcon,
  ProgressInprogressIcon,
  ProgressOnholdIcon,
  ProgressPendingIcon,
  ProgressRejectedIcon,
  ProgressTodoIcon,
} from "@salt-ds/icons";
import type { FC } from "react";
import { type ColorValueCellProps, IconDisplay } from "./ValueCells";

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
] as ProgressionData[];

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
    <FlowLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressTodoIcon
          size={2}
          style={{ color: "var(--salt-color-gray-500)" }}
        />
        <Code>progress-todo</Code>
      </FlexLayout>

      <FlexLayout gap={0.5} align="center">
        <ProgressDraftIcon
          size={2}
          style={{ color: "var(--salt-color-gray-500)" }}
        />
        <Code>progress-draft</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressOnholdIcon
          size={2}
          style={{ color: "var(--salt-palette-accent)" }}
        />
        <Code>progress-onhold</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressInprogressIcon
          size={2}
          style={{ color: "var(--salt-palette-accent)" }}
        />
        <Code>progress-inprogress</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressPendingIcon
          size={2}
          style={{ color: "var(--salt-color-orange-500)" }}
        />
        <Code>progress-pending</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCancelledIcon
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />
        <Code>progress-cancelled</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressRejectedIcon
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />
        <Code>progress-rejected</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCompleteIcon
          size={2}
          style={{ color: "var(--salt-color-green-500)" }}
        />
        <Code>progress-complete</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressClosedIcon
          size={2}
          style={{ color: "var(--salt-color-green-500)" }}
        />
        <Code>progress-closed</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
