import { ReactElement } from "react";
import { JSONByScope } from "./helpers/parseToJson";
import { ThemeMode } from "./header/ScopeSelector";
import { ScopeSelector } from "./header/ScopeSelector";
import { EditorView } from "./tokens/TokenEditorView";
import { ThemeHeader } from "./header/ThemeHeader";
import { foundationPathnames } from "./tokens/foundations/FoundationsView";
import { useTabsWithRouting } from "./utils/useTabsWithRouting";
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
import "./ThemeEditor.css";

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
    <div className="saltThemeEditor">
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
