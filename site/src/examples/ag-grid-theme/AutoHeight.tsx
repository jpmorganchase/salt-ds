import type { ColDef } from "ag-grid-community";
import { AgGridReact, type CustomCellRendererProps } from "ag-grid-react";

interface ExampleRow {
  label: string;
  content: string;
  fixedHeight?: number;
}

const rowData: ExampleRow[] = [
  { label: "Short text", content: "A short note." },
  {
    label: "Wrapped text",
    content:
      "This longer note wraps onto several lines. Its row grows to fit the content when the column becomes narrower or the density changes, while shorter content still respects the minimum height supplied by the theme.",
  },
  { label: "Empty cell", content: "" },
  { label: "Small renderer", content: "14px content", fixedHeight: 14 },
  { label: "Tall renderer", content: "100px content", fixedHeight: 100 },
];

const FixedHeightContent = ({
  data,
  value,
}: CustomCellRendererProps<ExampleRow, string>) => (
  <div
    style={{
      height: data?.fixedHeight,
      lineHeight: "14px",
      fontSize: 11,
      backgroundColor: "var(--salt-container-secondary-background)",
    }}
  >
    {value}
  </div>
);

const columnDefs: ColDef<ExampleRow>[] = [
  { headerName: "Content", field: "label", width: 160 },
  {
    headerName: "Note",
    field: "content",
    flex: 1,
    minWidth: 240,
    wrapText: true,
    autoHeight: true,
    cellRendererSelector: ({ data }) =>
      data?.fixedHeight ? { component: FixedHeightContent } : undefined,
  },
];

// AG Grid v36.3+ updates auto-height rows when the theme's CSS height changes.
export const AutoHeight = () => (
  <div className="ag-theme-salt" style={{ height: 450, width: "100%" }}>
    <AgGridReact theme="legacy" columnDefs={columnDefs} rowData={rowData} />
  </div>
);
