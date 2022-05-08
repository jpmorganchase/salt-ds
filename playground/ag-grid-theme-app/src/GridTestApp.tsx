import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { ToggleButton, ToggleButtonGroup } from "@jpmorganchase/uitk-lab";

import { AgGridReact } from "ag-grid-react";
import { useState } from "react";

import "@jpmorganchase/uitk-theme/index.css";
// No need to import ag grid css
import "@jpmorganchase/uitk-ag-grid-theme/index.css";

import "./GridTestApp.css";

export const GridTestApp = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [rowData] = useState([
    { make: "Toyota", model: "Celica", price: 35000 },
    { make: "Ford", model: "Mondeo", price: 32000 },
    { make: "Porsche", model: "Boxster", price: 72000 },
  ]);

  const [columnDefs] = useState([
    { field: "make" },
    { field: "model" },
    { field: "price" },
  ]);

  return (
    <ToolkitProvider theme={theme}>
      <div
        // ag grid scss generator doesn't work well with .uitk-light .ag-theme-uitk, e.g. line height problem
        className={`ag-theme-uitk-${theme} GridTestApp`}
      >
        <ToggleButtonGroup
          selectedIndex={theme === "light" ? 0 : 1}
          onChange={(_, index) => setTheme(index ? "dark" : "light")}
        >
          <ToggleButton ariaLabel="light theme">Light</ToggleButton>
          <ToggleButton ariaLabel="dark theme">Dark</ToggleButton>
        </ToggleButtonGroup>

        {/*
            Things won't work that well using pure ag grid scss theme
            - row hover shadow
            - selected cell focus style (i.e. box-shadow instead of out of box border)
         */}
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          // Need to match what's in css
          rowHeight={24}
          headerHeight={24}
          rowSelection="single"
        ></AgGridReact>
      </div>
    </ToolkitProvider>
  );
};
