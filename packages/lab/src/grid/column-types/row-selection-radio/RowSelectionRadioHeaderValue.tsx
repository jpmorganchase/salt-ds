import { makePrefixer } from "@brandname/core";
import { HeaderValueProps } from "../../model";
import "./RowSelectionRadioColumn.css";

const withBaseName = makePrefixer("uitkGridRowSelectionRadioHeaderValue");

// Can't select all in a single-select row mode. The header is empty (for now, this may change)
export const RowSelectionRadioHeaderValue =
  function RowSelectionRadioHeaderValue<T>(props: HeaderValueProps<T>) {
    return <div className={withBaseName()} />;
  };
