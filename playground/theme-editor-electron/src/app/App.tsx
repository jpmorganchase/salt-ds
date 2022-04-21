/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "@jpmorganchase/uitk-/theme-editor-app/src/ThemeEditorApp";
import {
  WindowContext,
  ElectronWindow,
} from "@jpmorganchase/uitk-lab/src/window";
import { isElectron } from "@jpmorganchase/uitk-lab/src/window/electron-utils";

import { CSSByPattern } from "@jpmorganchase/uitk-/theme-editor";

import "./App.css";
import { ThemeMode } from "@jpmorganchase/uitk-/theme-editor/src/header/ScopeSelector";

export const App = () => {
  const [cssByPattern, setCSSByPattern] = useState<CSSByPattern[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialClassNames, setInitialClassNames] = useState<string>();

  useEffect(() => {
    if (isElectron) {
      const getClassNames = async () => {
        const browserViewTheme = await (window as any).ipcRenderer.invoke(
          "get-browser-view-theme"
        );
        return browserViewTheme;
      };
      getClassNames()
        .catch((err) => console.log(err))
        .then((classNames) => {
          setInitialClassNames(classNames);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isLoading]);

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

  const setBrowserViewURL = (url: string) => {
    if (isElectron) {
      // eslint-disable-next-line
      (window as any).ipcRenderer.send("update-view-url", url);
      setIsLoading(true);
    }
  };

  const switchBrowserViewMode = (mode: string) => {
    if (isElectron) {
      // eslint-disable-next-line
      (window as any).ipcRenderer.send("change-mode", mode);
    }
  };

  return (
    <WindowContext.Provider value={ElectronWindow}>
      <BrowserRouter>
        <ThemeEditorApp
          isLoading={isLoading}
          initialTheme={
            initialClassNames?.includes("light")
              ? ThemeMode.LIGHT
              : ThemeMode.DARK
          }
          sendCSStoElectron={(cssByPattern: CSSByPattern[]) =>
            setCSSByPattern(cssByPattern)
          }
          switchBrowserViewMode={switchBrowserViewMode}
          saveCSSInElectron={saveCSS}
          loadPageinElectron={setBrowserViewURL}
        />
      </BrowserRouter>
    </WindowContext.Provider>
  );
};
