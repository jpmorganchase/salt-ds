import { useState, ReactElement, useCallback } from "react";
import { JSONByScope } from "./helpers/parseToJson";
import { ThemeMode } from "./header/ScopeSelector";
import { ScopeSelector } from "./header/ScopeSelector";
import { EditorView } from "./tokens/TokenEditorView";
import { ThemeHeader } from "./header/ThemeHeader";
import { foundationPathnames } from "./tokens/foundations/FoundationsView";
import { useTabsWithRouting } from "./utils/useTabsWithRouting";
import "@jpmorganchase/uitk-/theme/index.css";
import "./ThemeEditor.css";

export type ScopeAndJSON = {
  scope: string;
  jsonObj: JSON;
};

type ThemeEditorProps = {
  currentTheme: string;
  currentMode: ThemeMode;
  jsonByScope: JSONByScope[];
  redoDisabled: boolean;
  resetDisabled: boolean;
  themeNames: string[];
  undoDisabled: boolean;
  onChangeTheme: (themeName: string) => void;
  onClone: () => void;
  onModeChange: (mode: ThemeMode) => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  onUpload: (jsonByScope: JSONByScope[], themeName: string) => void;
  onUndo: () => void;
  onUpdateJSON: (newValue: string, pathToUpdate: string, scope: string) => void;
};

export const ThemeEditor = (props: ThemeEditorProps): ReactElement => {
  // This is outside for foundations since tabs not always rendered but location will change
  const [selectedFoundationTabIndex, handleFoundationTabSelection] =
    useTabsWithRouting(foundationPathnames, false);

  return (
    <div className="uitkThemeEditor">
      <ThemeHeader
        currentTheme={props.currentTheme}
        onChangeTheme={props.onChangeTheme}
        onClone={props.onClone}
        onRedo={props.onRedo}
        onReset={props.onReset}
        onSave={props.onSave}
        onUpload={props.onUpload}
        onUndo={props.onUndo}
        redoDisabled={props.redoDisabled}
        resetDisabled={props.resetDisabled}
        themeNames={props.themeNames}
        undoDisabled={props.undoDisabled}
      />
      <ScopeSelector />
      {props.jsonByScope && (
        <EditorView
          selectedFoundationTabIndex={selectedFoundationTabIndex}
          handleFoundationTabSelection={handleFoundationTabSelection}
          currentMode={props.currentMode}
          jsonByScope={props.jsonByScope}
          onModeChange={props.onModeChange}
          onUpdateJSON={props.onUpdateJSON}
        />
      )}
    </div>
  );
};
