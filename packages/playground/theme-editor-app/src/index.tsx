import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "./ThemeEditorApp";

import "./index.css";

ReactDOM.render(
  <BrowserRouter>
    <ThemeEditorApp />
  </BrowserRouter>,
  document.getElementById("root")
);
