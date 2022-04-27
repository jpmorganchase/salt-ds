import { BrowserRouter } from "react-router-dom";
import { ThemeEditorApp } from "./ThemeEditorApp";

import "./App.css";
import { GridItem } from "@jpmorganchase/uitk-lab";

declare global {
  interface BreakpointsType {
    mobile: string;
  }
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ThemeEditorApp />

      {/* BreakpointsType override is not taken into account */}
      <GridItem colSpan={{ mobile: 1 }} rowSpan={{ mobile: 2 }}>
        a
      </GridItem>
    </BrowserRouter>
  );
}

export default App;
