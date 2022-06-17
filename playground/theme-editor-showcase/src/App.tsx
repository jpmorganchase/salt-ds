/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "@jpmorganchase/theme-editor-app/src/ThemeEditorApp";
import { ElectronWindow } from "@jpmorganchase/uitk-lab/src/window";
import { WindowContext } from "@jpmorganchase/uitk-core/src/window";
import { isElectron } from "@jpmorganchase/uitk-lab/src/window/electron-utils";

import { CSSByPattern } from "@jpmorganchase/theme-editor";

import "./App.css";

export const App = () => {
  const [cssByPattern, setCSSByPattern] = useState<CSSByPattern[]>([]);

  useEffect(() => {
    if (isElectron) {
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
    if (isElectron) {
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
