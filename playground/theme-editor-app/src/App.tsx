import { BrowserRouter } from "react-router-dom";
import { ThemeEditorApp } from "./ThemeEditorApp";

import "./App.css";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ThemeEditorApp />
    </BrowserRouter>
  );
}

export default App;
