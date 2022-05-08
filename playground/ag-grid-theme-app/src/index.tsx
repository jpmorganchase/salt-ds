import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { GridTestApp } from "./GridTestApp";

import "./index.css";

ReactDOM.render(
  <BrowserRouter>
    <GridTestApp />
  </BrowserRouter>,
  document.getElementById("root")
);
