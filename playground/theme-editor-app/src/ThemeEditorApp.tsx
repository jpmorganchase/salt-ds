import {
  ReactElement,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ToolkitProvider } from "@salt-ds/core";
import {
  AppHeader,
  SearchInput,
  Spinner,
  useLayoutEffectSkipFirst,
  isDesktop,
} from "@salt-ds/lab";
import {
  CSSByPattern,
  JSONByScope,
  parseJSONtoCSS,
  ThemeEditor,
  uitkTheme,
} from "@salt-ds/theme-editor";
import { ThemeMode } from "@salt-ds/theme-editor/src/header/ScopeSelector";
import { ActionType } from "./helpers/Action";
import { jsonReducer } from "./helpers/jsonReducer";
import { useTheme } from "./helpers/useTheme";
import { DefaultView } from "./views/DefaultView";
import { CSSView } from "./views/CSSView";
import { saveToDirectory } from "./views/FileHandler";

import "@salt-ds/theme/index.css";
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/300-italic.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/500-italic.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/800.css";
import "@fontsource/open-sans/800-italic.css";

import "./ThemeEditorApp.css";

interface JSONHistory {
  action: ActionType;
  jsonByScope: JSONByScope[];
}

export const ThemeEditorApp = (props: {
  initialTheme?: ThemeMode;
  isLoading?: boolean;
  loadPageinElectron?: (url: string) => void;
  sendCSStoElectron?: (cssByPattern: CSSByPattern[]) => void;
  saveCSSInElectron?: () => void;
  switchBrowserViewMode?: (mode: string) => void;
}): ReactElement => {
  const [cssByPattern, saveCSS] = useState<CSSByPattern[]>();
  const [currentMode, setCurrentMode] = useState<ThemeMode>(
    props.initialTheme ?? ThemeMode.LIGHT
  );
  const [currentTheme, setThemeWithCallback] = useTheme({
    themeName: "UITK (Default)",
    jsonByScope: uitkTheme,
  });
  const [directoryName, saveDirectoryName] = useState<string>();
  const [themes, setThemes] = useState<
    { themeName: string; jsonByScope: JSONByScope[] }[]
  >([{ themeName: "UITK (Default)", jsonByScope: uitkTheme }]);

  const [jsonByScope, dispatch] = useReducer(jsonReducer, []);

  const savedJson = useRef<JSONHistory[]>([]);
  const positionInHistory = useRef<number>(0);

  useEffect(() => {
    if (props.initialTheme !== undefined) setCurrentMode(props.initialTheme);
  }, [props.initialTheme]);

  const onFileUpload = useCallback(
    (jsonByScope: JSONByScope[], themeName: string) => {
      setThemes([...themes, { themeName, jsonByScope }]);
      setThemeWithCallback(
        { themeName: themeName, jsonByScope: jsonByScope },
        dispatch
      );
    },
    [dispatch, themes, setThemeWithCallback]
  );

  const onUseToolkitTheme = useCallback(() => {
    setThemeWithCallback(
      { themeName: "UITK (Default)", jsonByScope: uitkTheme },
      dispatch
    );
  }, [dispatch, setThemeWithCallback]);

  useEffect(() => {
    if (isDesktop && props.sendCSStoElectron) {
      const cssByPattern = parseJSONtoCSS(jsonByScope);
      props.sendCSStoElectron(cssByPattern);
    }
  }, [jsonByScope]);

  useLayoutEffectSkipFirst(() => {
    if (isDesktop && props.switchBrowserViewMode) {
      props.switchBrowserViewMode(
        currentMode === ThemeMode.LIGHT ? "light" : "dark"
      );
    }
  }, [currentMode]);

  const onUpdateJSON = useCallback(
    (newValue: string, pathToUpdate: string, scope: string) => {
      if (!savedJson.current.length) {
        savedJson.current = [
          { action: ActionType.UPDATE, jsonByScope: jsonByScope },
        ];
      } else {
        if (positionInHistory.current !== savedJson.current.length) {
          savedJson.current = [
            ...savedJson.current.slice(0, positionInHistory.current + 1),
          ];
        } else {
          savedJson.current = [
            ...savedJson.current,
            { action: ActionType.UPDATE, jsonByScope: jsonByScope },
          ];
        }
      }
      positionInHistory.current++;
      const patternName = pathToUpdate.split("-")[0];
      dispatch({
        type: ActionType.UPDATE,
        payload: { patternName, newValue, pathToUpdate, scope },
      });
    },
    [dispatch, jsonByScope]
  );

  const onSave = async () => {
    const cssByPattern = parseJSONtoCSS(jsonByScope);
    if (!isDesktop) {
      const directoryName = (await saveToDirectory(cssByPattern)) as string;
      saveDirectoryName(directoryName);
      saveCSS(cssByPattern);
    } else if (props.saveCSSInElectron) {
      props.saveCSSInElectron();
    }
  };

  const onUndo = useCallback(() => {
    if (positionInHistory.current === savedJson.current.length) {
      savedJson.current = [
        ...savedJson.current,
        { action: ActionType.REPLACE, jsonByScope: jsonByScope },
      ];
    }

    const previousJson = savedJson.current[positionInHistory.current - 1];

    if (previousJson) {
      dispatch({
        type: ActionType.REPLACE,
        payload: [...previousJson.jsonByScope],
      });
      positionInHistory.current--;
    }
  }, [dispatch, jsonByScope]);

  const onRedo = useCallback(() => {
    const nextJson = savedJson.current[positionInHistory.current + 1];
    if (nextJson) {
      dispatch({
        type: ActionType.REPLACE,
        payload: [...nextJson.jsonByScope],
      });
      positionInHistory.current++;
    }
  }, [dispatch]);

  const onReset = useCallback(() => {
    const defaultJsonByScope = savedJson.current[0];
    if (defaultJsonByScope) {
      savedJson.current = [];
      dispatch({
        type: ActionType.REPLACE,
        payload: [...defaultJsonByScope.jsonByScope],
      });
      positionInHistory.current = 0;
    }
  }, [dispatch]);

  const onClone = () => {
    onFileUpload(jsonByScope, `${currentTheme.themeName}-cloned`);
  };

  const onChangeTheme = (themeName: string) => {
    const updatedThemes: { themeName: string; jsonByScope: JSONByScope[] }[] =
      themes.map((theme) => {
        let themeUpdated: { themeName: string; jsonByScope: JSONByScope[] };
        if (theme.themeName === currentTheme.themeName) {
          themeUpdated = { themeName: theme.themeName, jsonByScope };
        } else {
          themeUpdated = theme;
        }
        return themeUpdated;
      });

    setThemes(updatedThemes);
    const theme = themes.find((theme) => theme.themeName === themeName);

    if (theme) {
      setThemeWithCallback(theme, dispatch);
    }
  };

  const navigate = useNavigate();
  useEffect(() => navigate("/"), []);

  const onUpdateURL = (url: string | undefined) => {
    if (props.loadPageinElectron && url) props.loadPageinElectron(url);
  };

  const onModeChange = useCallback((mode: ThemeMode) => {
    setCurrentMode(mode);
  }, []);

  return (
    <ToolkitProvider>
      <div className="uitkThemeEditorApp">
        <div className="uitkThemeEditorApp-leftPane">
          {props.isLoading ? (
            <Spinner className="uitkThemeEditorApp-Spinner" />
          ) : (
            <Routes>
              <Route
                path="/*"
                element={
                  jsonByScope.length ? (
                    <ThemeEditor
                      currentMode={currentMode}
                      currentTheme={currentTheme.themeName}
                      jsonByScope={jsonByScope}
                      onClone={onClone}
                      onModeChange={onModeChange}
                      onRedo={onRedo}
                      onReset={onReset}
                      onSave={onSave}
                      onUpdateJSON={onUpdateJSON}
                      onUpload={onFileUpload}
                      onUndo={onUndo}
                      undoDisabled={
                        positionInHistory.current === 0 ? true : false
                      }
                      redoDisabled={
                        positionInHistory.current + 1 < savedJson.current.length
                          ? false
                          : true
                      }
                      resetDisabled={
                        savedJson.current.length === 0 ? true : false
                      }
                      onChangeTheme={onChangeTheme}
                      themeNames={themes.map((theme) => theme.themeName)}
                    />
                  ) : (
                    <DefaultView
                      onFileUpload={onFileUpload}
                      onUseToolkitTheme={onUseToolkitTheme}
                    />
                  )
                }
              />
            </Routes>
          )}
        </div>
        <div className="uitkThemeEditorAppOutputHeader">
          {isDesktop && (
            <AppHeader>
              <SearchInput
                defaultValue={"http://localhost:3005"}
                onSubmit={onUpdateURL}
              />
            </AppHeader>
          )}
          {cssByPattern && directoryName && (
            <CSSView
              cssByPattern={cssByPattern}
              directoryName={directoryName}
            />
          )}
        </div>
      </div>
    </ToolkitProvider>
  );
};
