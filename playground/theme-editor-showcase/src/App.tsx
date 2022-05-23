/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "@jpmorganchase/theme-editor-app/src/ThemeEditorApp";
import {
  ElectronWindow,
  WindowContext,
} from "@jpmorganchase/uitk-lab/src/window";
import { isDesktop } from "@jpmorganchase/uitk-lab";

import { CSSByPattern } from "@jpmorganchase/theme-editor";

import "./App.css";

export const App = () => {
  const [cssByPattern, setCSSByPattern] = useState<CSSByPattern[]>([]);

  useEffect(() => {
    if (isDesktop) {
      let cssString = "";
      cssByPattern?.forEach((element) => {
        cssString += element.cssObj;
      });
      // eslint-disable-next-line
      (window as any).ipcRenderer.send(
        "update-styles",
        `"${cssString.replaceAll("\n", "")}"`
      );
    }
  }, [cssByPattern]);

  const saveCSS = () => {
    if (isDesktop) {
      // eslint-disable-next-line
      (window as any).ipcRenderer.send("save-styles", cssByPattern);
    }
  };

  return (
    <WindowContext.Provider value={ElectronWindow}>
      <BrowserRouter>
        <ThemeEditorApp
          sendCSStoElectron={(cssByPattern: CSSByPattern[]) =>
            setCSSByPattern(cssByPattern)
          }
          saveCSSInElectron={saveCSS}
        />
      </BrowserRouter>
    </WindowContext.Provider>
  );
};
