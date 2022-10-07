/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "@jpmorganchase/theme-editor-app/src/ThemeEditorApp";
import { ElectronWindow } from "@jpmorganchase/uitk-lab/src/window";
import { WindowContext } from "@jpmorganchase/uitk-core/src/window";
import { isDesktop } from "@jpmorganchase/uitk-core";

import { CSSByPattern } from "@jpmorganchase/theme-editor";
import { ThemeMode } from "@jpmorganchase/theme-editor/src/header/ScopeSelector";

import "./App.css";

export const App = () => {
  const [cssByPattern, setCSSByPattern] = useState<CSSByPattern[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialClassNames, setInitialClassNames] = useState<string>();

  useEffect(() => {
    if (isDesktop) {
      const getClassNames = async () => {
        return await (window as any).ipcRenderer.invoke(
          "get-browser-view-theme"
        );
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

  const setBrowserViewURL = (url: string) => {
    if (isDesktop) {
      // eslint-disable-next-line
      (window as any).ipcRenderer.send("update-view-url", url);
      setIsLoading(true);
    }
  };

  const switchBrowserViewMode = (mode: string) => {
    if (isDesktop) {
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
          loadPageInElectron={setBrowserViewURL}
        />
      </BrowserRouter>
    </WindowContext.Provider>
  );
};
