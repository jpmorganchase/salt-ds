import { FormFieldProps } from "@jpmorganchase/uitk-core";

export interface ToolbarItemProps {
  inOverflowPanel?: undefined | true;
  orientation?: "horizontal" | "vertical";
}

export interface ToolbarFieldProps extends FormFieldProps, ToolbarItemProps {}
