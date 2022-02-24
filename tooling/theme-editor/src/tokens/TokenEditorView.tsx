import { useMemo, useCallback, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { CharacteristicsView } from "./characteristics/CharacteristicsView";
import { extractValueFromJSON } from "../helpers/extractValue";
import { FoundationsView } from "./foundations/FoundationsView";
import { JSONByScope } from "../helpers/parseToJson";
import { ThemeMode } from "../header/ScopeSelector";
import "./TokenEditorView.css";

interface EditorViewProps {
  currentMode: ThemeMode;
  jsonByScope: JSONByScope[];
  selectedFoundationTabIndex: number;
  handleFoundationTabSelection: (tabIndex: number, path?: string) => void;
  onUpdateJSON: (newValue: string, pathToUpdate: string, scope: string) => void;
  onModeChange: (mode: ThemeMode) => void;
}

export const EditorView = (props: EditorViewProps): React.ReactElement => {
  const mode = props.currentMode === ThemeMode.LIGHT ? "LIGHT" : "DARK";
  const jsonInCurrentScope = useMemo<JSONByScope[]>(() => {
    return props.jsonByScope.filter(
      (s) =>
        [
          mode,
          "DENSITY-TOUCH",
          "DENSITY-LOW",
          "DENSITY-MEDIUM",
          "DENSITY-HIGH",
        ].includes(s.scope.toUpperCase()) ||
        s.scope.toUpperCase() === "DENSITY-ALL" ||
        s.scope.toUpperCase() === "MODE-ALL"
    );
  }, [props.jsonByScope, mode]);
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/foundations/color");
  }, []);

  const extractValue = useCallback(
    (value: string) => {
      return extractValueFromJSON(value, jsonInCurrentScope);
    },
    [jsonInCurrentScope]
  );

  return (
    <div className="uitkEditorView">
      <Routes>
        <Route
          path="/foundations/*"
          element={
            <FoundationsView
              extractValue={extractValue}
              jsonInCurrentScope={jsonInCurrentScope}
              mode={props.currentMode}
              selectedTabIndex={props.selectedFoundationTabIndex}
              handleTabSelection={props.handleFoundationTabSelection}
              onModeChange={props.onModeChange}
              onUpdateJSON={props.onUpdateJSON}
            />
          }
        />
        <Route
          path="/characteristics"
          element={
            <CharacteristicsView
              extractValue={extractValue}
              jsonInCurrentScope={jsonInCurrentScope}
              mode={props.currentMode}
              onModeChanged={props.onModeChange}
              onUpdateJSON={props.onUpdateJSON}
            />
          }
        />
      </Routes>
    </div>
  );
};
